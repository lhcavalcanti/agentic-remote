# Agentic Remote - Graphify code map

Snapshot: `cae879d60d0834eb5b221b5cb25d8edd74f3dcf86c3926fbbcb9a5a23154c222`

Source checkout: `9870ae558b480d1353ffd5e6dfe7fc316ac53e47`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 268 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 268 files · ~551,559 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 4136 nodes · 11730 edges · 160 communities (120 shown, 25 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 811 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App.tsx
- App
- SessionDetail
- api.ts
- ClaudeAgentService
- AgentService
- .readAfterWrites
- contracts.ts
- claude-agent-service.ts
- ManagedSession
- agentic-remote-promotion-monitor
- terminal-session.ts
- CopilotSessionLike
- queued-provider-dispatch.test.ts
- TmuxTerminalSessionController
- session-presentation.ts
- ManagerAgent
- markdown-navigation.ts
- manager-tools.ts
- ManagerAssistant.tsx
- SessionService
- RemoteNodeClient
- agent-service.ts
- manager-agent.ts
- manager-store.ts
- .get
- bundle
- pwa.ts
- session-knowledge-routes.test.ts
- ProviderSessionService
- terminal-startup-queue.test.ts
- lib.rs
- FakeSessionService
- shell.ts
- active-sessions.ts
- agentic-remote-promotion-setup
- config.rs
- background-task-adapter.ts
- hub-routes.ts
- workspace-browser.ts
- devDependencies
- agentic-remote
- cleanDialogLine
- dependencies
- SessionKnowledgeStore
- node-routes.ts
- manager-agent.test.ts
- terminal-session.test.ts
- SessionOrderStore
- delegated-transcription-service.ts
- session-reply-durability.test.ts
- PushNotificationService
- cli-canary.ts
- scripts
- KnowledgeStore
- noTmuxServer
- compilerOptions
- ManagerStore
- transcription-service.ts
- app.ts
- capture-workspace.ts
- recordValue
- normalizeKnowledgeRelativePath
- startup-phases.test.ts
- session-clear-transcript.test.ts
- session-knowledge-store.ts
- session-store-providers.test.ts
- PromptCards.tsx
- knowledgePathChain
- compilerOptions
- .toolHost
- compilerOptions
- check-workspace-review-regressions.ts
- compilerOptions
- .isRetiredSession
- directory-browser.ts
- recordValue
- event-log.ts
- ManagerMemory
- terminal-form-deadline.test.ts
- use-session-knowledge-root.ts
- ReaderWorkspace
- react
- background-task-stop.test.ts
- NewSessionDialog
- recovery-resend-durability.test.ts
- session-resource-routes.test.ts
- registerSessionKnowledgeRoutes
- desktop.json
- OracleSettings.tsx
- BackgroundTasksDialog.tsx
- capture-workbench-review.ts
- workspace-fixtures.ts
- .oxlintrc.json
- settings-local.json
- DeferredSession
- promotion-monitor.test.ts
- submission-error.ts
- session-resource-providers.test.ts
- TranscriptionError
- session-response-order.ts
- scripts
- agent-service.test.ts
- background-task-tracker.ts
- push-notification-service.ts
- recovery-seed-guards.test.ts
- session-resource-clear.test.ts
- html-preview.ts
- session-knowledge-routes.ts
- server/side-question.ts
- setupWorkspaceFixture
- generate-pwa-icons.ts
- session-resource-transport.ts
- bridge.rs
- screenshot-stability.test.ts
- KnowledgePosition
- promotion-setup-execution.test.ts
- package.json
- release-publication.test.ts
- render-workspace-gifs.ts
- recovery-context.ts
- settings.ts
- composer-layout.test.ts
- removeComputer
- FakeRecorder
- FakeRecorder
- .discoverTerminalSessions
- background-tasks.ts
- MockMediaRecorder
- MermaidDiagram.tsx
- version-policy.test.ts
- MockWebSocket
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
2. `App()` - 259 edges
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
- `AgentServiceEvents` --references--> `ServerEvent`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `BackgroundTaskUpdate` --references--> `BackgroundTaskSnapshot`  [EXTRACTED]
  server/background-task-tracker.ts → shared/contracts.ts
- `RemoteSessionListing` --references--> `ManagedSession`  [EXTRACTED]
  server/computer-manager.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (160 total, 25 thin omitted)

### Community 0 - "App.tsx"
Cohesion: 0.02
Nodes (114): ActivityStatus, AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph() (+106 more)

### Community 1 - "App"
Cohesion: 0.04
Nodes (127): askSession(), activeComposerPastes(), App(), adoptConversationReplacement(), appendComposerForKey(), appKeyDown(), applyComputerSnapshot(), applySession() (+119 more)

### Community 2 - "SessionDetail"
Cohesion: 0.05
Nodes (47): fixture(), PendingClaudeReply, recoveryFixture(), fixture(), claudeFixture(), copilotFixture(), seed(), fixture() (+39 more)

### Community 3 - "api.ts"
Cohesion: 0.03
Nodes (111): AddKnowledgeRootInput, PushSettings, addKnowledgeRoot(), bootstrapSessionOrder(), cancelBackgroundTask(), cancelSession(), clearConversation(), configureRuntime() (+103 more)

### Community 4 - "ClaudeAgentService"
Cohesion: 0.04
Nodes (22): ClaudeAgentService, isClaudeAuthenticationError(), isMissingClaudeSessionError(), toolResultText(), acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery() (+14 more)

### Community 5 - "AgentService"
Cohesion: 0.04
Nodes (14): AgentService, isMissingSessionError(), persistedFormAnswer(), restart(), removeCopilotSessionFiles(), RuntimeConfigurationError, TerminalFormContinuation, validateUserInputForm() (+6 more)

### Community 6 - ".readAfterWrites"
Cohesion: 0.06
Nodes (4): isUncertainDelivery(), TerminalSessionController, hasRunningBackgroundAgent(), deliveryUncertaintyFromError()

### Community 7 - "contracts.ts"
Cohesion: 0.05
Nodes (46): ClaudeAgentServiceEvents, DirectoryScope, directories, routingFixture(), session(), temporaryDirectory(), AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER (+38 more)

### Community 8 - "claude-agent-service.ts"
Cohesion: 0.08
Nodes (54): AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, PendingClaudeInput, PendingClaudePermission, RemoteSessionListing, sessionAtLeastAsNew() (+46 more)

### Community 9 - "ManagedSession"
Cohesion: 0.10
Nodes (9): ComputerManager, managedSession(), RegisteredComputer, registerHubRoutes(), SessionMuteCarrier, ComputerSummary, ManagedRemovedQueuedPrompt, ManagedSession (+1 more)

### Community 10 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (71): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+63 more)

### Community 11 - "terminal-session.ts"
Cohesion: 0.05
Nodes (66): composer(), processAdapter, boxedComposerFrame(), captureTerminal(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFocusWitnessed(), composerFrameText() (+58 more)

### Community 12 - "CopilotSessionLike"
Cohesion: 0.04
Nodes (32): CopilotClientLike, CopilotSessionLike, holdProbe(), fixtures, gate(), releases, directories, fakeClient() (+24 more)

### Community 13 - "queued-provider-dispatch.test.ts"
Cohesion: 0.04
Nodes (44): ClaudeSdk, cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle(), connect() (+36 more)

### Community 14 - "TmuxTerminalSessionController"
Cohesion: 0.10
Nodes (20): capturePane(), copilotCommand(), endProbeSession(), execFileAsync, isTerminalAgentWorking(), isTerminalOverlay(), isTerminalSessionInUsePrompt(), isTerminalVisiblyIdle() (+12 more)

### Community 15 - "session-presentation.ts"
Cohesion: 0.07
Nodes (50): SessionExecutionMode, KnowledgeRootSelector(), root, reorderSessionLaneWithHiddenFollowers(), SessionFilter, sessionNavigationView, stepVisibleSession(), computers (+42 more)

### Community 16 - "ManagerAgent"
Cohesion: 0.10
Nodes (10): checkContent(), delay(), errorMessage(), isNotFound(), ManagerAgent, sameRuntime(), TurnError, withTimeout() (+2 more)

### Community 17 - "markdown-navigation.ts"
Cohesion: 0.07
Nodes (44): executeCommand(), listWorkspace(), readWorkspaceFile(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink(), KnowledgeReader() (+36 more)

### Community 18 - "manager-tools.ts"
Cohesion: 0.07
Nodes (28): APPROVE_WORDS, computerField, createManagerTools(), define(), deliver(), requireComputer(), resolveSession(), trustFolder() (+20 more)

### Community 19 - "ManagerAssistant.tsx"
Cohesion: 0.07
Nodes (43): ManagerSessionRef, ManagerSnapshot, ManagerStatus, cancelManager(), editQueuedManagerMessage(), getManager(), removeQueuedManagerMessage(), resetManager() (+35 more)

### Community 20 - "SessionService"
Cohesion: 0.07
Nodes (10): ActiveClaudeQuery, registerNodeRoutes(), releases, session, snapshot, readServiceResources(), readSessionSkills(), ResourceReads (+2 more)

### Community 21 - "RemoteNodeClient"
Cohesion: 0.05
Nodes (14): RemoteResync, RemoteSessionRead, headerSafe(), RemoteNodeClient, client(), servers, session, AudioTranscription (+6 more)

### Community 22 - "agent-service.ts"
Cohesion: 0.05
Nodes (47): AcceptedSdkReply, ActivePrompt, activityGroupIdFor(), ActivityToolStart, AgentServiceEvents, ansiSequence, commandShortcut(), DeliveryBoundary (+39 more)

### Community 23 - "manager-agent.ts"
Cohesion: 0.07
Nodes (33): CreationRuntime, ManagerEventSource, discover(), isPending(), isQueued(), ManagerAgentOptions, Rung, TURN_ACTIVITY (+25 more)

### Community 24 - "manager-store.ts"
Cohesion: 0.09
Nodes (28): ago(), attentionRank(), buildTurnContext(), changeLines(), clock(), MANAGER_SYSTEM_PROMPT, managerPrompt(), oneLine() (+20 more)

### Community 26 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 27 - "pwa.ts"
Cohesion: 0.10
Nodes (36): directories, AppVersion, parseAppVersion(), deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart() (+28 more)

### Community 28 - "session-knowledge-routes.test.ts"
Cohesion: 0.07
Nodes (21): ServerRole, fixture(), managers, releases, remote, session(), SessionMetadataLookup, ComputerRegistry (+13 more)

### Community 30 - "terminal-startup-queue.test.ts"
Cohesion: 0.11
Nodes (35): exec, formFixture(), horizontalFormFixture(), textFieldFormFixture(), directories, exec, client(), disk (+27 more)

### Community 31 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 33 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 34 - "active-sessions.ts"
Cohesion: 0.11
Nodes (35): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+27 more)

### Community 35 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 36 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 37 - "background-task-adapter.ts"
Cohesion: 0.13
Nodes (36): addActivity(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), boundedText(), CopilotClientTaskInfo, CopilotClientTaskProgress, errorValue(), eventTask() (+28 more)

### Community 38 - "hub-routes.ts"
Cohesion: 0.07
Nodes (35): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+27 more)

### Community 39 - "workspace-browser.ts"
Cohesion: 0.10
Nodes (29): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+21 more)

### Community 40 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 41 - "agentic-remote"
Cohesion: 0.13
Nodes (31): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+23 more)

### Community 42 - "cleanDialogLine"
Cohesion: 0.14
Nodes (30): activeBottomFrame(), cleanDialogLine(), clearAutomaticStartupPrompts(), containsCopiedInteractiveFrame(), desktopInstallPromptIdentity(), findTerminalWrappedText(), FormReplyDeadlineError, hasClippedTerminalFormTabs() (+22 more)

### Community 43 - "dependencies"
Cohesion: 0.06
Nodes (33): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, @fastify/multipart, @fastify/static, @fastify/websocket, lucide-react (+25 more)

### Community 44 - "SessionKnowledgeStore"
Cohesion: 0.13
Nodes (10): bindingKey(), SessionKnowledgeConflictError, SessionKnowledgeRecoveryError, SessionKnowledgeStore, disk, fixture(), fixtures, releases (+2 more)

### Community 45 - "node-routes.ts"
Cohesion: 0.08
Nodes (27): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile(), configureRuntimeSchema, createSessionSchema (+19 more)

### Community 46 - "manager-agent.test.ts"
Cohesion: 0.08
Nodes (14): ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig, Behavior, computers, fail(), FakeClient (+6 more)

### Community 47 - "terminal-session.test.ts"
Cohesion: 0.09
Nodes (22): parseTerminalUpdateNotice(), terminalFormCommitKeys(), bracketedTabPane, clearFixture(), deliveryFixture(), desktopInstallPane, directories, downloadedUpdateFooter (+14 more)

### Community 48 - "SessionOrderStore"
Cohesion: 0.15
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 49 - "delegated-transcription-service.ts"
Cohesion: 0.11
Nodes (13): BuildAppOptions, collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation (+5 more)

### Community 50 - "session-reply-durability.test.ts"
Cohesion: 0.13
Nodes (18): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRequest() (+10 more)

### Community 51 - "PushNotificationService"
Cohesion: 0.18
Nodes (4): brief(), HubEventSource, PushNotificationService, registerPushRoutes()

### Community 52 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 53 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 54 - "KnowledgeStore"
Cohesion: 0.17
Nodes (8): WorkspaceFixtureState, KnowledgeRootReservation, KnowledgeState, KnowledgeStore, directories, fixture(), createHub(), KnowledgeRoot

### Community 55 - "noTmuxServer"
Cohesion: 0.11
Nodes (16): listTmuxSessions(), noTmuxServer(), processGone(), procVisible(), socketIdentity(), directories, { execute }, files (+8 more)

### Community 56 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 57 - "ManagerStore"
Cohesion: 0.15
Nodes (4): openStore(), emptyState(), ManagerStore, open()

### Community 58 - "transcription-service.ts"
Cohesion: 0.11
Nodes (19): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+11 more)

### Community 59 - "app.ts"
Cohesion: 0.15
Nodes (17): prefixes, session, trusted, untrusted, buildApp(), errorStatusCode(), isAppleTouchIconProbe(), transcriptionComputerName() (+9 more)

### Community 60 - "capture-workspace.ts"
Cohesion: 0.19
Nodes (21): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+13 more)

### Community 61 - "recordValue"
Cohesion: 0.21
Nodes (21): activityDuration(), activityKind(), activityResult(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), isBackgroundTaskEvent() (+13 more)

### Community 62 - "normalizeKnowledgeRelativePath"
Cohesion: 0.17
Nodes (18): knowledgeFileSchema, knowledgeRelativePathSchema, scopedKnowledgePath(), pathRecordSchema, joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath() (+10 more)

### Community 63 - "startup-phases.test.ts"
Cohesion: 0.12
Nodes (12): phases, port, createStartupPhases(), startManagedServer(), StartupPhaseEvent, StartupPhaseRecord, address, directories (+4 more)

### Community 64 - "session-clear-transcript.test.ts"
Cohesion: 0.11
Nodes (9): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions, disk, fixtures, gate(), holdTurnWrite() (+1 more)

### Community 65 - "session-knowledge-store.ts"
Cohesion: 0.10
Nodes (19): bindingSchema, Identity, PathRecord, pathRecordKey(), PathState, pathStateFor(), pathStateSchema, PersistedBinding (+11 more)

### Community 66 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (10): claude(), clearFixture(), copilot(), disk, event(), fixture(), fixtures, releases (+2 more)

### Community 67 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (19): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+11 more)

### Community 68 - "knowledgePathChain"
Cohesion: 0.15
Nodes (21): listKnowledgeEntries(), readKnowledgeFile(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor(), knowledgeTreeKeyDown() (+13 more)

### Community 69 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 71 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 72 - "check-workspace-review-regressions.ts"
Cohesion: 0.13
Nodes (15): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+7 more)

### Community 73 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 75 - "directory-browser.ts"
Cohesion: 0.23
Nodes (11): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin(), SessionDirectoryError (+3 more)

### Community 76 - "recordValue"
Cohesion: 0.18
Nodes (19): attachmentModeValue(), backgroundHandoff(), booleanValue(), eventString(), lastForegroundCompletionAt(), normalizedToolName(), notificationKind(), parsedValue() (+11 more)

### Community 77 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 78 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 79 - "terminal-form-deadline.test.ts"
Cohesion: 0.13
Nodes (13): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+5 more)

### Community 80 - "use-session-knowledge-root.ts"
Cohesion: 0.19
Nodes (12): getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey(), knowledgePositionForBinding(), SessionIdentity (+4 more)

### Community 81 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 82 - "react"
Cohesion: 0.18
Nodes (8): react, transcribeAudio(), MarkdownCodeBlock(), copy(), originalClipboard, SessionActions(), recordingDuration(), useVoiceRecorder()

### Community 83 - "background-task-stop.test.ts"
Cohesion: 0.21
Nodes (13): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), snapshot() (+5 more)

### Community 84 - "NewSessionDialog"
Cohesion: 0.20
Nodes (16): provider(), activateSession(), createSession(), listDirectories(), listHistory(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse() (+8 more)

### Community 85 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 86 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 87 - "registerSessionKnowledgeRoutes"
Cohesion: 0.27
Nodes (11): registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession(), recordReplacement() (+3 more)

### Community 88 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 89 - "OracleSettings.tsx"
Cohesion: 0.23
Nodes (9): RuntimeModelOption, updateManagerSettings(), effortFrom(), efforts, OracleSettings(), save(), saveFolder(), update() (+1 more)

### Community 90 - "BackgroundTasksDialog.tsx"
Cohesion: 0.23
Nodes (10): DialogFrame(), BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive() (+2 more)

### Community 91 - "capture-workbench-review.ts"
Cohesion: 0.17
Nodes (10): frame(), geometry, output, scratch, screenshot(), { values }, fixtureSessions, IDLE_SESSION_ID (+2 more)

### Community 92 - "workspace-fixtures.ts"
Cohesion: 0.17
Nodes (12): documents, FIXTURE_NOW, fixtureBackgroundTasks, fixtureEndpoints, fixtureKnowledgeListings, fixtureKnowledgePositions, fixtureModels, runtime (+4 more)

### Community 93 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 94 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 95 - "DeferredSession"
Cohesion: 0.17
Nodes (4): DeferredSession, CopilotTaskInfo, CopilotTaskProgress, BackgroundTaskKind

### Community 96 - "promotion-monitor.test.ts"
Cohesion: 0.27
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 97 - "submission-error.ts"
Cohesion: 0.26
Nodes (8): RemoteNodeRedirectError, RemoteNodeRequestError, httpDeliveryUncertain(), legacyDefinitiveHttpRefusals, parseSubmissionReceipt(), SubmissionError, SubmissionReceipt, submissionReceiptFromError()

### Community 98 - "session-resource-providers.test.ts"
Cohesion: 0.19
Nodes (12): ClaudeMcpRead, copilotFixture(), deferred(), directory(), DiscoveredMcp, DiscoveredSkills, fixtures, Mcp (+4 more)

### Community 99 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 100 - "session-response-order.ts"
Cohesion: 0.27
Nodes (11): sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), currentSessionEventSequence(), nextSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences (+3 more)

### Community 101 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+4 more)

### Community 102 - "agent-service.test.ts"
Cohesion: 0.20
Nodes (9): foregroundTurnOpen(), isForegroundCompletionEvent(), isForegroundLifecycleEvent(), statusFromEvents(), terminalFormSteps(), directories, services, TerminalCancelOptions (+1 more)

### Community 103 - "background-task-tracker.ts"
Cohesion: 0.30
Nodes (6): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 104 - "push-notification-service.ts"
Cohesion: 0.17
Nodes (9): PushSender, PushState, directories, RFC-8030, RFC-8030, sessionMuteSchema, subscriptionSchema, testNotificationSchema (+1 more)

### Community 105 - "recovery-seed-guards.test.ts"
Cohesion: 0.18
Nodes (8): bootLegacy(), directories, execute, pending, releases, SeedState, services, stores

### Community 106 - "session-resource-clear.test.ts"
Cohesion: 0.18
Nodes (11): apps, directories, directory(), obstructUploads(), pairedFixture(), providers, seed(), sockets (+3 more)

### Community 107 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 108 - "session-knowledge-routes.ts"
Cohesion: 0.18
Nodes (6): Lineage, RegistrationGeneration, ReplacementEvidence, SessionKnowledgeLifecycle, sessionParams, updateSchema

### Community 109 - "server/side-question.ts"
Cohesion: 0.27
Nodes (8): SIDE_QUESTION_CLEANUP_MS, SIDE_QUESTION_RUNTIME_IDLE_MS, SIDE_QUESTION_TIMEOUT_MS, sideQuestionBoundary(), sideQuestionPrompt(), SIDE_QUESTION_EARLIER_ANSWER_MAX_LENGTH, SIDE_QUESTION_EARLIER_LIMIT, SIDE_QUESTION_MAX_LENGTH

### Community 110 - "setupWorkspaceFixture"
Cohesion: 0.24
Nodes (6): pageFor(), createWorkspaceFixtureState(), fixtureBaseUrl(), fixtureValue(), setupWorkspaceFixture(), fixtureApi()

### Community 111 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 112 - "session-resource-transport.ts"
Cohesion: 0.31
Nodes (8): CopilotResourceMethod, readClaudeMcp(), readCopilotResource(), copilotTransport(), disposals, Frame, write(), unavailable()

### Community 113 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 114 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 115 - "KnowledgePosition"
Cohesion: 0.33
Nodes (5): WorkspaceFixtureOptions, KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 116 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 117 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, packageManager, private, type, version

### Community 118 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 119 - "render-workspace-gifs.ts"
Cohesion: 0.29
Nodes (6): directory, { values }, workflows, pnpm, onlyBuiltDependencies, ffmpeg-static

### Community 120 - "recovery-context.ts"
Cohesion: 0.38
Nodes (4): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief

### Community 121 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 122 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 123 - "removeComputer"
Cohesion: 0.60
Nodes (5): addComputer(), removeComputer(), ComputersDialog(), remove(), submit()

### Community 130 - "MermaidDiagram.tsx"
Cohesion: 0.67
Nodes (3): drawDiagram(), drawing, MermaidDiagram()

## Knowledge Gaps
- **735 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+730 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1141 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **25 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `ClaudeAgentService`, `.readAfterWrites`, `contracts.ts`, `claude-agent-service.ts`, `agent-service.test.ts`, `.isRetiredSession`, `directory-browser.ts`, `agent-service.ts`, `.get`, `recordValue`, `.discoverTerminalSessions`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionDetail` to `ClaudeAgentService`, `AgentService`, `.readAfterWrites`, `contracts.ts`, `.isRetiredSession`, `.get`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionService` connect `SessionService` to `contracts.ts`, `claude-agent-service.ts`, `.isRetiredSession`, `RemoteNodeClient`, `ProviderSessionService`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _735 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.02374727668845316 - nodes in this community are weakly interconnected._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.040132669983416254 - nodes in this community are weakly interconnected._
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
