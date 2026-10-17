# Agentic Remote - Graphify code map

Snapshot: `6c3bafda193f85e61a71604b09e17a85b83736dd09f38573334cfceacb15d373`

Source checkout: `53a77168fdc7ceeb51f694244e2515c7bafc611e`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 269 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 269 files · ~552,775 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 4144 nodes · 11747 edges · 164 communities (123 shown, 25 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 811 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App
- App.tsx
- SessionDetail
- App.test.tsx
- AgentService
- session-store.ts
- contracts.ts
- claude-agent-service.ts
- session-store-providers.test.ts
- agentic-remote-promotion-monitor
- terminal-session.ts
- active-sessions.ts
- ManagerAssistant.tsx
- ManagerAgent
- session-presentation.ts
- manager-agent.ts
- manager-tools.ts
- agent-service.ts
- .readAfterWrites
- ClaudeAgentService
- api.ts
- markdown-navigation.ts
- .sendInternal
- TmuxTerminalSessionController
- RemoteNodeClient
- manager-store.ts
- bundle
- ProviderSessionService
- FakeSessionService
- pwa.ts
- ComputerManager
- terminal-startup-queue.test.ts
- workspace-fixtures.ts
- lib.rs
- SessionService
- shell.ts
- TerminalSessionController
- agentic-remote-promotion-setup
- config.rs
- .syncTranscripts
- background-task-adapter.ts
- hub-routes.ts
- knowledge-tree.ts
- .runQuery
- devDependencies
- agentic-remote
- node-routes.ts
- dependencies
- SessionOrderStore
- session-reply-durability.test.ts
- session-resource-providers.test.ts
- delegated-transcription-service.ts
- cli-canary.ts
- ComputerSummary
- ManagerStore
- terminal-session.test.ts
- scripts
- KnowledgeStore
- directory-browser.ts
- SessionKnowledgeStore
- transcription-service.ts
- compilerOptions
- capture-workspace.ts
- ManagedSession
- PushNotificationService
- HubEvent
- app.ts
- startup-phases.test.ts
- manager-routes.ts
- PromptCards.tsx
- compilerOptions
- recovery-resend-durability.test.ts
- SessionKnowledgeBinding
- compilerOptions
- compilerOptions
- recordValue
- event-log.ts
- ManagerMemory
- workspace-browser.ts
- normalizeKnowledgeRelativePath
- queueConflict
- NodeIdentityStore
- session-knowledge-store.ts
- use-oracle-settings.ts
- ReaderWorkspace
- terminal-form-deadline.test.ts
- background-task-stop.test.ts
- queued-provider-dispatch.test.ts
- session-resource-routes.test.ts
- check-workspace-review-regressions.ts
- desktop.json
- queued-dispatch.test.ts
- registerSessionKnowledgeRoutes
- BackgroundTasksDialog.tsx
- .oxlintrc.json
- settings-local.json
- .askSession
- DeferredSession
- promotion-monitor.test.ts
- TranscriptionError
- scripts
- session-knowledge-routes.test.ts
- background-task-tracker.ts
- SessionAdmissions
- session-resource-clear.test.ts
- session-response-order.ts
- html-preview.ts
- session-knowledge-routes.ts
- server/side-question.ts
- generate-pwa-icons.ts
- RuntimeModelOption
- session-resource-transport.ts
- bridge.rs
- deleteSession
- screenshot-stability.test.ts
- session-admission-lifecycle.test.ts
- promotion-setup-execution.test.ts
- remote-node-client.test.ts
- session-knowledge-store.test.ts
- package.json
- release-publication.test.ts
- render-workspace-gifs.ts
- StartupPhases
- recovery-context.ts
- settings.ts
- composer-layout.test.ts
- knowledge-restore.ts
- MarkdownCodeBlock.tsx
- hub-routes.test.ts
- FakeRecorder
- .discoverTerminalSessions
- terminal-send-uncertainty.test.ts
- MermaidDiagram.tsx
- ManagerEventSource
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
1. `SessionDetail` - 279 edges
2. `App()` - 258 edges
3. `AgentService` - 240 edges
4. `SessionStore` - 162 edges
5. `ClaudeAgentService` - 120 edges
6. `ManagedSession` - 91 edges
7. `ComputerManager` - 82 edges
8. `registerHubRoutes()` - 78 edges
9. `SessionService` - 71 edges
10. `TmuxTerminalSessionController` - 69 edges

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

## Communities (164 total, 25 thin omitted)

### Community 0 - "App"
Cohesion: 0.03
Nodes (154): isManagerEvent(), clearConversation(), recoverConversation(), removeQueuedPrompt(), reorderQueuedPrompts(), replyPermission(), saveSessionOrderLane(), saveSessionVisibility() (+146 more)

### Community 1 - "App.tsx"
Cohesion: 0.03
Nodes (104): ActivityStatus, AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph() (+96 more)

### Community 2 - "SessionDetail"
Cohesion: 0.06
Nodes (14): PendingClaudeReply, fixture(), observe(), clearRecoverySeedFailure(), cloneSession(), grantTerminalRecovery(), ownsRecoverySeedFailure(), SessionStore (+6 more)

### Community 3 - "App.test.tsx"
Cohesion: 0.03
Nodes (90): provider(), activateSession(), addKnowledgeRoot(), askSession(), bootstrapSessionOrder(), cancelBackgroundTask(), cancelSession(), configureRuntime() (+82 more)

### Community 4 - "AgentService"
Cohesion: 0.06
Nodes (6): agentMode(), AgentService, isMissingSessionError(), removeCopilotSessionFiles(), RuntimeConfigurationError, deliveryUncertaintyFromError()

### Community 5 - "session-store.ts"
Cohesion: 0.03
Nodes (58): CopilotClientLike, CopilotSessionLike, foregroundTurnOpen(), holdProbe(), fixtures, gate(), releases, directories (+50 more)

### Community 6 - "contracts.ts"
Cohesion: 0.05
Nodes (47): ClaudeAgentServiceEvents, managers, releases, remote, RemoteResync, RemoteSessionRead, RegistryState, directories (+39 more)

### Community 7 - "claude-agent-service.ts"
Cohesion: 0.07
Nodes (54): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, PendingClaudeInput, PendingClaudePermission, releases (+46 more)

### Community 8 - "session-store-providers.test.ts"
Cohesion: 0.04
Nodes (52): fixture(), fixture(), connect(), createStore(), deferred(), disk, enqueue(), fixture() (+44 more)

### Community 9 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (71): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+63 more)

### Community 10 - "terminal-session.ts"
Cohesion: 0.05
Nodes (67): boxedComposerFrame(), captureTerminal(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFocusWitnessed(), composerFrameText(), composerHasFocus(), composerHoldsOtherText() (+59 more)

### Community 11 - "active-sessions.ts"
Cohesion: 0.06
Nodes (50): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+42 more)

### Community 12 - "ManagerAssistant.tsx"
Cohesion: 0.06
Nodes (42): react, editQueuedManagerMessage(), removeQueuedManagerMessage(), resetManager(), resolveManagerConfirmation(), retryManagerMessage(), sendManagerMessage(), transcribeAudio() (+34 more)

### Community 13 - "ManagerAgent"
Cohesion: 0.10
Nodes (12): checkContent(), delay(), discover(), errorMessage(), isNotFound(), ManagerAgent, sameRuntime(), TurnError (+4 more)

### Community 14 - "session-presentation.ts"
Cohesion: 0.07
Nodes (49): SessionExecutionMode, KnowledgeRootSelector(), root, SessionFilter, sessionNavigationView, computers, first, grouped (+41 more)

### Community 15 - "manager-agent.ts"
Cohesion: 0.06
Nodes (32): isPending(), isQueued(), ManagerAgentOptions, ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig, Rung (+24 more)

### Community 16 - "manager-tools.ts"
Cohesion: 0.07
Nodes (29): APPROVE_WORDS, computerField, createManagerTools(), define(), deliver(), requireComputer(), resolveSession(), trustFolder() (+21 more)

### Community 17 - "agent-service.ts"
Cohesion: 0.04
Nodes (48): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), ActivityToolStart, AgentServiceEvents, ansiSequence, commandShortcut() (+40 more)

### Community 19 - "ClaudeAgentService"
Cohesion: 0.08
Nodes (3): ClaudeAgentService, isMissingClaudeSessionError(), toolResultText()

### Community 20 - "api.ts"
Cohesion: 0.07
Nodes (41): RemoteNodeRedirectError, RemoteNodeRequestError, AddKnowledgeRootInput, ManagedSessionMcpServersSnapshot, ManagedSessionSkillsSnapshot, PushSettings, SessionMcpServerSummary, SessionResourceSource (+33 more)

### Community 21 - "markdown-navigation.ts"
Cohesion: 0.08
Nodes (40): executeCommand(), listWorkspace(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink(), KnowledgeReader(), markdownComponentsFor() (+32 more)

### Community 22 - ".sendInternal"
Cohesion: 0.11
Nodes (37): activeBottomFrame(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), containsCopiedInteractiveFrame(), desktopInstallPromptIdentity(), findTerminalWrappedText(), hasClippedTerminalFormFooter() (+29 more)

### Community 23 - "TmuxTerminalSessionController"
Cohesion: 0.11
Nodes (12): copilotCommand(), endProbeSession(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand(), safeWindowName(), tmuxSessionExists() (+4 more)

### Community 24 - "RemoteNodeClient"
Cohesion: 0.06
Nodes (7): RemoteNodeClient, hasActiveBackgroundTasks(), BackgroundTaskSnapshot, NodeInfo, RemovedQueuedPrompt, WorkspaceFile, WorkspaceListing

### Community 25 - "manager-store.ts"
Cohesion: 0.10
Nodes (28): ago(), attentionRank(), buildTurnContext(), changeLines(), clock(), MANAGER_SYSTEM_PROMPT, managerPrompt(), oneLine() (+20 more)

### Community 26 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 28 - "FakeSessionService"
Cohesion: 0.06
Nodes (6): FakeSessionService, routingFixture(), session(), temporaryDirectory(), safeUploadName(), SessionFileUpload

### Community 29 - "pwa.ts"
Cohesion: 0.09
Nodes (37): directories, AppVersion, parseAppVersion(), deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart() (+29 more)

### Community 30 - "ComputerManager"
Cohesion: 0.18
Nodes (3): ComputerManager, managedSession(), registerHubRoutes()

### Community 31 - "terminal-startup-queue.test.ts"
Cohesion: 0.11
Nodes (35): exec, formFixture(), horizontalFormFixture(), textFieldFormFixture(), directories, exec, client(), disk (+27 more)

### Community 32 - "workspace-fixtures.ts"
Cohesion: 0.08
Nodes (31): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, createWorkspaceFixtureState() (+23 more)

### Community 33 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 35 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 36 - "TerminalSessionController"
Cohesion: 0.09
Nodes (5): persistedFormAnswer(), TerminalFormContinuation, TerminalFormReplyError, TerminalSessionController, PendingUserInput

### Community 37 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 38 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 39 - ".syncTranscripts"
Cohesion: 0.13
Nodes (24): activityKind(), activityResult(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), isBackgroundTaskEvent(), isForegroundCompletionEvent() (+16 more)

### Community 40 - "background-task-adapter.ts"
Cohesion: 0.13
Nodes (36): addActivity(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), boundedText(), CopilotClientTaskInfo, CopilotClientTaskProgress, errorValue(), eventTask() (+28 more)

### Community 41 - "hub-routes.ts"
Cohesion: 0.06
Nodes (37): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+29 more)

### Community 42 - "knowledge-tree.ts"
Cohesion: 0.09
Nodes (35): WorkspaceEntry, listKnowledgeEntries(), readKnowledgeFile(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor() (+27 more)

### Community 43 - ".runQuery"
Cohesion: 0.11
Nodes (16): isClaudeAuthenticationError(), acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight(), QueuedDelivery (+8 more)

### Community 44 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 45 - "agentic-remote"
Cohesion: 0.13
Nodes (31): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+23 more)

### Community 46 - "node-routes.ts"
Cohesion: 0.07
Nodes (29): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile(), AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER (+21 more)

### Community 47 - "dependencies"
Cohesion: 0.06
Nodes (33): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, @fastify/multipart, @fastify/static, @fastify/websocket, lucide-react (+25 more)

### Community 48 - "SessionOrderStore"
Cohesion: 0.15
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 49 - "session-reply-durability.test.ts"
Cohesion: 0.13
Nodes (18): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRequest() (+10 more)

### Community 50 - "session-resource-providers.test.ts"
Cohesion: 0.10
Nodes (19): cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle(), claudeFixture(), ClaudeMcpRead (+11 more)

### Community 51 - "delegated-transcription-service.ts"
Cohesion: 0.11
Nodes (13): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, transcriptionComputerName() (+5 more)

### Community 52 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 53 - "ComputerSummary"
Cohesion: 0.13
Nodes (6): fixture(), session(), sessionAtLeastAsNew(), RegisteredComputer, createHub(), ComputerSummary

### Community 54 - "ManagerStore"
Cohesion: 0.13
Nodes (4): openStore(), emptyState(), ManagerStore, open()

### Community 55 - "terminal-session.test.ts"
Cohesion: 0.10
Nodes (21): parseTerminalUpdateNotice(), terminalFormCommitKeys(), bracketedTabPane, clearFixture(), deliveryFixture(), desktopInstallPane, directories, downloadedUpdateFooter (+13 more)

### Community 56 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 57 - "KnowledgeStore"
Cohesion: 0.18
Nodes (7): WorkspaceFixtureState, KnowledgeRootReservation, KnowledgeState, KnowledgeStore, directories, fixture(), KnowledgeRoot

### Community 58 - "directory-browser.ts"
Cohesion: 0.17
Nodes (13): DirectoryScope, displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin() (+5 more)

### Community 59 - "SessionKnowledgeStore"
Cohesion: 0.17
Nodes (5): bindingKey(), SessionKnowledgeRecoveryError, SessionKnowledgeStore, stateSchema, stateWithPaths()

### Community 60 - "transcription-service.ts"
Cohesion: 0.10
Nodes (20): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+12 more)

### Community 61 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 62 - "capture-workspace.ts"
Cohesion: 0.19
Nodes (21): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+13 more)

### Community 63 - "ManagedSession"
Cohesion: 0.18
Nodes (4): RemoteSessionListing, ManagerHub, ManagedSession, SessionListing

### Community 64 - "PushNotificationService"
Cohesion: 0.25
Nodes (3): brief(), PushNotificationService, registerPushRoutes()

### Community 65 - "HubEvent"
Cohesion: 0.11
Nodes (13): WorkspaceFixture, ComputerManagerEvents, HubEventSource, PushSender, PushState, directories, RFC-8030, RFC-8030 (+5 more)

### Community 66 - "app.ts"
Cohesion: 0.16
Nodes (15): prefixes, session, trusted, untrusted, buildApp(), errorStatusCode(), isAppleTouchIconProbe(), build() (+7 more)

### Community 67 - "startup-phases.test.ts"
Cohesion: 0.12
Nodes (12): phases, port, createStartupPhases(), startManagedServer(), StartupPhaseEvent, StartupPhaseRecord, address, directories (+4 more)

### Community 68 - "manager-routes.ts"
Cohesion: 0.15
Nodes (12): confirmationSchema, defaultsSchema, editSchema, effort, managerInputError(), ManagerRouteAgent, messageParams, registerManagerRoutes() (+4 more)

### Community 69 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (19): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+11 more)

### Community 70 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 71 - "recovery-resend-durability.test.ts"
Cohesion: 0.12
Nodes (15): restart(), directories, disk, fixture(), gate(), gates, httpBoundary(), initialize() (+7 more)

### Community 72 - "SessionKnowledgeBinding"
Cohesion: 0.18
Nodes (14): SessionKnowledgeEvents, SessionKnowledgeBinding, getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey() (+6 more)

### Community 73 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 74 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 75 - "recordValue"
Cohesion: 0.18
Nodes (19): attachmentModeValue(), backgroundHandoff(), booleanValue(), eventString(), lastForegroundCompletionAt(), normalizedToolName(), notificationKind(), parsedValue() (+11 more)

### Community 76 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 77 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 78 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 79 - "normalizeKnowledgeRelativePath"
Cohesion: 0.22
Nodes (15): joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath(), slashPath(), scopedKnowledgeRoot(), KnowledgeRootChoice (+7 more)

### Community 80 - "queueConflict"
Cohesion: 0.23
Nodes (4): preparePrompt(), queueConflict(), QueuedPromptReservation, QueuedPromptDispatchResult

### Community 81 - "NodeIdentityStore"
Cohesion: 0.18
Nodes (4): ComputerRegistry, directories, remoteSnapshotFixture(), NodeIdentityStore

### Community 82 - "session-knowledge-store.ts"
Cohesion: 0.12
Nodes (16): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+8 more)

### Community 83 - "use-oracle-settings.ts"
Cohesion: 0.19
Nodes (13): getManager(), updateManagerSettings(), setup(), effortFrom(), efforts, OracleModelSettings(), OracleSettingsStatus(), HarnessProps (+5 more)

### Community 85 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 86 - "terminal-form-deadline.test.ts"
Cohesion: 0.15
Nodes (12): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+4 more)

### Community 87 - "background-task-stop.test.ts"
Cohesion: 0.21
Nodes (13): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), snapshot() (+5 more)

### Community 88 - "queued-provider-dispatch.test.ts"
Cohesion: 0.16
Nodes (9): claudeFixture(), copilotFixture(), copilotSession(), fixtures, gate(), originalQueue, pause(), releases (+1 more)

### Community 89 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 90 - "check-workspace-review-regressions.ts"
Cohesion: 0.15
Nodes (11): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+3 more)

### Community 91 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 92 - "queued-dispatch.test.ts"
Cohesion: 0.15
Nodes (7): deferred(), disk, fixtures, holdWrite(), prompt(), releases, target

### Community 93 - "registerSessionKnowledgeRoutes"
Cohesion: 0.30
Nodes (11): registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession(), recordReplacement() (+3 more)

### Community 94 - "BackgroundTasksDialog.tsx"
Cohesion: 0.23
Nodes (10): DialogFrame(), BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive() (+2 more)

### Community 95 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 96 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 98 - "DeferredSession"
Cohesion: 0.17
Nodes (4): DeferredSession, CopilotTaskInfo, CopilotTaskProgress, BackgroundTaskKind

### Community 99 - "promotion-monitor.test.ts"
Cohesion: 0.27
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 100 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 101 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+4 more)

### Community 102 - "session-knowledge-routes.test.ts"
Cohesion: 0.18
Nodes (9): ServerRole, SessionMetadataLookup, disk, FakeManager, fixtures, gate(), holdWrite(), releases (+1 more)

### Community 103 - "background-task-tracker.ts"
Cohesion: 0.30
Nodes (6): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 104 - "SessionAdmissions"
Cohesion: 0.20
Nodes (4): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions

### Community 105 - "session-resource-clear.test.ts"
Cohesion: 0.18
Nodes (11): apps, directories, directory(), obstructUploads(), pairedFixture(), providers, seed(), sockets (+3 more)

### Community 106 - "session-response-order.ts"
Cohesion: 0.29
Nodes (10): sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), currentSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences, sessionResponseStartedAt() (+2 more)

### Community 107 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 108 - "session-knowledge-routes.ts"
Cohesion: 0.18
Nodes (6): Lineage, RegistrationGeneration, ReplacementEvidence, SessionKnowledgeLifecycle, sessionParams, updateSchema

### Community 109 - "server/side-question.ts"
Cohesion: 0.27
Nodes (8): SIDE_QUESTION_CLEANUP_MS, SIDE_QUESTION_RUNTIME_IDLE_MS, SIDE_QUESTION_TIMEOUT_MS, sideQuestionBoundary(), sideQuestionPrompt(), SIDE_QUESTION_EARLIER_ANSWER_MAX_LENGTH, SIDE_QUESTION_EARLIER_LIMIT, SIDE_QUESTION_MAX_LENGTH

### Community 110 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 112 - "session-resource-transport.ts"
Cohesion: 0.31
Nodes (8): CopilotResourceMethod, readClaudeMcp(), readCopilotResource(), copilotTransport(), disposals, Frame, write(), unavailable()

### Community 113 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 114 - "deleteSession"
Cohesion: 0.24
Nodes (10): addComputer(), cancelManager(), deleteKnowledgeRoot(), deleteSession(), removeComputer(), requestVoid(), removeRoot(), ComputersDialog() (+2 more)

### Community 115 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 116 - "session-admission-lifecycle.test.ts"
Cohesion: 0.25
Nodes (7): ClaudeSdk, deferred(), disk, enqueue(), fixtures, holdAdmissionWrite(), releases

### Community 117 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 118 - "remote-node-client.test.ts"
Cohesion: 0.28
Nodes (5): client(), servers, session, TERMINAL_REQUEST_TIMEOUT_MS, TERMINAL_STARTUP_TIMEOUT_MS

### Community 119 - "session-knowledge-store.test.ts"
Cohesion: 0.25
Nodes (6): SessionKnowledgeConflictError, disk, fixture(), fixtures, releases, root()

### Community 120 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, packageManager, private, type, version

### Community 121 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 122 - "render-workspace-gifs.ts"
Cohesion: 0.29
Nodes (6): directory, { values }, workflows, pnpm, onlyBuiltDependencies, ffmpeg-static

### Community 124 - "recovery-context.ts"
Cohesion: 0.38
Nodes (4): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief

### Community 125 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 126 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 127 - "knowledge-restore.ts"
Cohesion: 0.47
Nodes (3): knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 128 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 134 - "MermaidDiagram.tsx"
Cohesion: 0.67
Nodes (3): drawDiagram(), drawing, MermaidDiagram()

## Knowledge Gaps
- **737 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+732 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1144 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **25 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `.askSession`, `SessionDetail`, `TerminalSessionController`, `.discoverTerminalSessions`, `.syncTranscripts`, `claude-agent-service.ts`, `recovery-resend-durability.test.ts`, `.runQuery`, `.readAfterWrites`, `.publicSession`, `directory-browser.ts`, `ProviderSessionService`, `FakeSessionService`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionDetail` to `AgentService`, `TerminalSessionController`, `session-store.ts`, `.syncTranscripts`, `session-store-providers.test.ts`, `.readAfterWrites`, `.publicSession`, `FakeSessionService`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionService` connect `SessionService` to `claude-agent-service.ts`, `ProviderSessionService`, `ComputerSummary`, `directory-browser.ts`, `StartupPhases`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _737 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.03023001095290252 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.025904761904761906 - nodes in this community are weakly interconnected._
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
