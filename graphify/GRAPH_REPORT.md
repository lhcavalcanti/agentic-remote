# Agentic Remote - Graphify code map

Snapshot: `cff58a51294a389ce6b7d1e827ee4525d65bd2268b57dfc4d80e793cc739842d`

Source checkout: `224aeaca6c8ac1cf1196093396f8b0e4cd452013`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 262 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 262 files · ~524,679 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 4004 nodes · 11317 edges · 157 communities (117 shown, 25 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 785 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App.tsx
- App
- SessionStore
- api.ts
- SessionDetail
- ClaudeAgentService
- .sendAdmittedWithBackend
- contracts.ts
- background-task-adapter.ts
- session-presentation.ts
- ManagedSession
- terminal-session.ts
- agentic-remote-promotion-monitor
- agent-service.ts
- computer-manager.ts
- manager-agent.ts
- queued-dispatch.test.ts
- .get
- RemoteNodeClient
- TmuxTerminalSessionController
- ManagerAgent
- SessionService
- markdown-navigation.ts
- bundle
- ProviderSessionService
- session-knowledge-routes.test.ts
- remote-node-client.ts
- ManagerAssistant.tsx
- terminal-startup-queue.test.ts
- manager-tools.ts
- lib.rs
- session-resource-providers.test.ts
- terminal-session.test.ts
- SessionKnowledgeStore
- config.rs
- FakeSessionService
- hub-routes.ts
- pwa.ts
- devDependencies
- knowledge-tree.ts
- agentic-remote
- dependencies
- agentic-remote-promotion-setup
- active-sessions.ts
- CopilotClientLike
- SessionOrderStore
- app.ts
- manager.ts
- node-routes.ts
- noTmuxServer
- agent-service.test.ts
- PushNotificationService
- cli-canary.ts
- scripts
- shell.ts
- transcription-service.ts
- compilerOptions
- KnowledgeStore
- delegated-transcription-service.ts
- isTerminalComposerFooter
- capture-workspace.ts
- startup-phases.test.ts
- session-clear-transcript.test.ts
- session-reply-durability.test.ts
- PromptCards.tsx
- terminal-form-deadline.test.ts
- compilerOptions
- compilerOptions
- compilerOptions
- directory-browser.ts
- event-log.ts
- ManagerMemory
- session-knowledge-store.ts
- session-store-providers.test.ts
- workspace-browser.ts
- normalizeKnowledgeRelativePath
- server/side-question.ts
- manager-context.ts
- use-session-knowledge-root.ts
- ReaderWorkspace
- workspace-fixtures.ts
- recovery-resend-durability.test.ts
- session-resource-routes.test.ts
- check-workspace-review-regressions.ts
- desktop.json
- .toolHost
- capture-workbench-review.ts
- .oxlintrc.json
- settings-local.json
- registerSessionKnowledgeRoutes
- TranscriptionError
- shell-notifications.ts
- scripts
- promotion-monitor.test.ts
- push-notification-service.ts
- recovery-seed-guards.test.ts
- session-resource-clear.test.ts
- NewSessionDialog
- BackgroundTasksDialog.tsx
- html-preview.ts
- ManagerSdkSession
- session-knowledge-routes.ts
- session-response-order.ts
- setupWorkspaceFixture
- generate-pwa-icons.ts
- DeferredSession
- ManagerSdkClient
- session-enqueue-clear.test.ts
- bridge.rs
- screenshot-stability.test.ts
- KnowledgePosition
- node:fs/promises
- session-resource-transport.ts
- package.json
- release-publication.test.ts
- render-workspace-gifs.ts
- transcription-routes.ts
- recovery-context.ts
- settings.ts
- composer-layout.test.ts
- MarkdownCodeBlock.tsx
- .discoverTerminalSessions
- promotion-setup-execution.test.ts
- terminal-send-uncertainty.test.ts
- background-tasks.ts
- MockMediaRecorder
- MermaidDiagram.tsx
- version-policy.test.ts
- queued-commands.ts
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
2. `App()` - 257 edges
3. `AgentService` - 234 edges
4. `SessionStore` - 160 edges
5. `ClaudeAgentService` - 120 edges
6. `ManagedSession` - 82 edges
7. `ComputerManager` - 81 edges
8. `registerHubRoutes()` - 78 edges
9. `SessionService` - 71 edges
10. `TmuxTerminalSessionController` - 67 edges

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

## Communities (157 total, 25 thin omitted)

### Community 0 - "App.tsx"
Cohesion: 0.02
Nodes (121): isManagerEvent(), addComputer(), removeComputer(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation() (+113 more)

### Community 1 - "App"
Cohesion: 0.04
Nodes (131): activeComposerPastes(), App(), adoptConversationReplacement(), appendComposerForKey(), appKeyDown(), applyComputerSnapshot(), applySession(), askAboutKnowledgeFile() (+123 more)

### Community 2 - "SessionStore"
Cohesion: 0.04
Nodes (48): fixture(), fixture(), connect(), createStore(), enqueue(), fixture(), recoveryFixture(), fixture() (+40 more)

### Community 3 - "api.ts"
Cohesion: 0.04
Nodes (109): httpDeliveryUncertain(), legacyDefinitiveHttpRefusals, parseSubmissionReceipt(), SubmissionError, submissionReceiptFromError(), activateSession(), addKnowledgeRoot(), askSession() (+101 more)

### Community 4 - "SessionDetail"
Cohesion: 0.05
Nodes (9): AgentService, persistedFormAnswer(), terminalFormSteps(), validateUserInputForm(), fixture(), StoredSession, TranscriptObservation, ChatMessage (+1 more)

### Community 5 - "ClaudeAgentService"
Cohesion: 0.06
Nodes (6): ClaudeAgentService, isMissingClaudeSessionError(), preparePrompt(), queueConflict(), copilotRequest(), RuntimeModelOption

### Community 6 - ".sendAdmittedWithBackend"
Cohesion: 0.06
Nodes (8): isUncertainDelivery(), httpBoundary(), QueuedPromptReservation, StartupPhases, isTerminalOverlay(), isTerminalSessionInUsePrompt(), hasRunningBackgroundAgent(), deliveryUncertaintyFromError()

### Community 7 - "contracts.ts"
Cohesion: 0.05
Nodes (46): RuntimeConfigurationError, AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission (+38 more)

### Community 8 - "background-task-adapter.ts"
Cohesion: 0.07
Nodes (73): addActivity(), attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), boundedText(), CopilotClientTaskInfo (+65 more)

### Community 9 - "session-presentation.ts"
Cohesion: 0.05
Nodes (60): react, SessionMcpServerSummary, SessionResourceSource, SessionSkillSummary, DialogFrame(), KnowledgeRootSelector(), root, reorderSessionLaneWithHiddenFollowers() (+52 more)

### Community 10 - "ManagedSession"
Cohesion: 0.10
Nodes (12): ComputerManager, managedSession(), sessionAtLeastAsNew(), RegisteredComputer, registerHubRoutes(), SessionMuteCarrier, FakeManager, createHub() (+4 more)

### Community 11 - "terminal-session.ts"
Cohesion: 0.07
Nodes (64): activeBottomFrame(), cleanDialogLine(), clearAutomaticStartupPrompts(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFocusWitnessed(), containsCopiedInteractiveFrame(), desktopInstallPromptIdentity() (+56 more)

### Community 12 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (67): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+59 more)

### Community 13 - "agent-service.ts"
Cohesion: 0.07
Nodes (61): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, AgentServiceEvents (+53 more)

### Community 14 - "computer-manager.ts"
Cohesion: 0.09
Nodes (46): ClaudeResources, RemoteSessionListing, claudeMcp(), claudeSkillNames(), copilotMcp, copilotSkills, copilotWorkspaceMcp, CopilotWorkspaceSkills (+38 more)

### Community 15 - "manager-agent.ts"
Cohesion: 0.06
Nodes (26): ManagerAgentOptions, ManagerSdkEvent, ManagerSdkSessionConfig, Rung, Behavior, computers, FakeSdk, openStore() (+18 more)

### Community 16 - "queued-dispatch.test.ts"
Cohesion: 0.06
Nodes (31): acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight(), QueuedDelivery, QueuedDispatches (+23 more)

### Community 17 - ".get"
Cohesion: 0.08
Nodes (7): agentMode(), isMissingSessionError(), removeCopilotSessionFiles(), TerminalSessionController, PendingPermission, PendingUserInput, SessionRuntimeInfo

### Community 18 - "RemoteNodeClient"
Cohesion: 0.06
Nodes (14): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), RemoteResync, RemoteSessionRead, RemoteNodeClient (+6 more)

### Community 19 - "TmuxTerminalSessionController"
Cohesion: 0.11
Nodes (11): capturePane(), copilotCommand(), execFileAsync, isTerminalAgentWorking(), isTerminalVisiblyIdle(), processAncestors(), processCommand(), safeWindowName() (+3 more)

### Community 20 - "ManagerAgent"
Cohesion: 0.12
Nodes (10): delay(), discover(), errorMessage(), isNotFound(), ManagerAgent, TurnError, withTimeout(), ManagerSkillSummary (+2 more)

### Community 21 - "SessionService"
Cohesion: 0.07
Nodes (8): ActiveClaudeQuery, registerNodeRoutes(), releases, session, snapshot, ResourceReads, resourceRequestHandler(), SessionService

### Community 22 - "markdown-navigation.ts"
Cohesion: 0.09
Nodes (38): executeCommand(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), MarkdownImage() (+30 more)

### Community 23 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 25 - "session-knowledge-routes.test.ts"
Cohesion: 0.07
Nodes (22): ServerRole, ComputerManagerEvents, fixture(), managers, releases, remote, session(), SessionMetadataLookup (+14 more)

### Community 26 - "remote-node-client.ts"
Cohesion: 0.07
Nodes (22): DirectoryScope, DEFINITE_DISPATCH_REFUSALS, headerSafe(), normalizeNodeUrl(), REDIRECT_STATUSES, client(), servers, session (+14 more)

### Community 27 - "ManagerAssistant.tsx"
Cohesion: 0.09
Nodes (27): ManagerSessionRef, cancelManager(), getManager(), resetManager(), resolveManagerConfirmation(), retryManagerMessage(), sendManagerMessage(), phoneEnterCreatesNewline() (+19 more)

### Community 28 - "terminal-startup-queue.test.ts"
Cohesion: 0.10
Nodes (32): directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), exec, formFixture(), horizontalFormFixture() (+24 more)

### Community 29 - "manager-tools.ts"
Cohesion: 0.10
Nodes (20): computerField, createManagerTools(), define(), requireComputer(), resolveSession(), errorMessage(), failure(), link() (+12 more)

### Community 30 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 31 - "session-resource-providers.test.ts"
Cohesion: 0.06
Nodes (32): ClaudeSdk, cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle(), deferred() (+24 more)

### Community 32 - "terminal-session.test.ts"
Cohesion: 0.08
Nodes (33): composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), occurrences(), paneEvidenceCount(), paneShowsText(), parseTerminalUpdateNotice() (+25 more)

### Community 33 - "SessionKnowledgeStore"
Cohesion: 0.10
Nodes (14): WorkspaceFixtureState, bindingKey(), SessionKnowledgeConflictError, SessionKnowledgeEvents, SessionKnowledgeRecoveryError, SessionKnowledgeStore, stateSchema, stateWithPaths() (+6 more)

### Community 34 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 35 - "FakeSessionService"
Cohesion: 0.08
Nodes (5): FakeSessionService, routingFixture(), session(), temporaryDirectory(), SideQuestionExchange

### Community 36 - "hub-routes.ts"
Cohesion: 0.06
Nodes (37): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+29 more)

### Community 37 - "pwa.ts"
Cohesion: 0.11
Nodes (34): deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate(), testNotification() (+26 more)

### Community 38 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 39 - "knowledge-tree.ts"
Cohesion: 0.10
Nodes (32): WorkspaceEntry, applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor(), knowledgeTreeKeyDown(), loadKnowledgeChain() (+24 more)

### Community 40 - "agentic-remote"
Cohesion: 0.13
Nodes (31): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+23 more)

### Community 41 - "dependencies"
Cohesion: 0.06
Nodes (33): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, @fastify/multipart, @fastify/static, @fastify/websocket, lucide-react (+25 more)

### Community 42 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (30): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+22 more)

### Community 43 - "active-sessions.ts"
Cohesion: 0.14
Nodes (30): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+22 more)

### Community 44 - "CopilotClientLike"
Cohesion: 0.07
Nodes (17): CopilotClientLike, holdProbe(), fixtures, gate(), releases, directories, fakeClient(), ForkRequest (+9 more)

### Community 45 - "SessionOrderStore"
Cohesion: 0.15
Nodes (13): start(), directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey() (+5 more)

### Community 46 - "app.ts"
Cohesion: 0.11
Nodes (21): prefixes, session, trusted, untrusted, directories, buildApp(), errorStatusCode(), isAppleTouchIconProbe() (+13 more)

### Community 47 - "manager.ts"
Cohesion: 0.09
Nodes (20): ManagerEventSource, confirmationSchema, defaultsSchema, effort, ManagerRouteAgent, messageParams, registerManagerRoutes(), sendSchema (+12 more)

### Community 48 - "node-routes.ts"
Cohesion: 0.07
Nodes (27): MAX_SESSION_FILE_BYTES, SessionParams, supportedExtensions, supportsSessionFile(), AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, configureRuntimeSchema, createSessionSchema (+19 more)

### Community 49 - "noTmuxServer"
Cohesion: 0.09
Nodes (20): endProbeSession(), listTmuxSessions(), processAlive(), tmuxSessionExists(), waitForExit(), noTmuxServer(), processGone(), procVisible() (+12 more)

### Community 50 - "agent-service.test.ts"
Cohesion: 0.10
Nodes (15): CopilotSessionLike, foregroundTurnOpen(), isForegroundCompletionEvent(), isForegroundLifecycleEvent(), statusFromEvents(), configurableModel(), directories, FakeCopilotClient (+7 more)

### Community 51 - "PushNotificationService"
Cohesion: 0.18
Nodes (4): brief(), HubEventSource, PushNotificationService, registerPushRoutes()

### Community 52 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 53 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 54 - "shell.ts"
Cohesion: 0.15
Nodes (24): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), onShellDeepLink(), onShellNotificationReply(), openShellSettings() (+16 more)

### Community 55 - "transcription-service.ts"
Cohesion: 0.10
Nodes (20): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+12 more)

### Community 56 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 57 - "KnowledgeStore"
Cohesion: 0.19
Nodes (6): KnowledgeRootReservation, KnowledgeState, KnowledgeStore, directories, fixture(), KnowledgeRoot

### Community 58 - "delegated-transcription-service.ts"
Cohesion: 0.13
Nodes (11): BuildAppOptions, collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation (+3 more)

### Community 59 - "isTerminalComposerFooter"
Cohesion: 0.13
Nodes (20): boxedComposerFrame(), captureTerminal(), composerFrameText(), composerHasFocus(), composerRowText(), cursorComposerFrame(), DownloadedUpdateCell, downloadedUpdateFooterBlock() (+12 more)

### Community 60 - "capture-workspace.ts"
Cohesion: 0.20
Nodes (20): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+12 more)

### Community 61 - "startup-phases.test.ts"
Cohesion: 0.12
Nodes (12): phases, port, createStartupPhases(), startManagedServer(), StartupPhaseEvent, StartupPhaseRecord, address, directories (+4 more)

### Community 62 - "session-clear-transcript.test.ts"
Cohesion: 0.11
Nodes (9): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions, disk, fixtures, gate(), holdTurnWrite() (+1 more)

### Community 63 - "session-reply-durability.test.ts"
Cohesion: 0.17
Nodes (17): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRunFixture() (+9 more)

### Community 64 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (19): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+11 more)

### Community 65 - "terminal-form-deadline.test.ts"
Cohesion: 0.12
Nodes (15): TerminalFormContinuation, question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture() (+7 more)

### Community 66 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 67 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 68 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 69 - "directory-browser.ts"
Cohesion: 0.23
Nodes (11): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin(), SessionDirectoryError (+3 more)

### Community 70 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 71 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 72 - "session-knowledge-store.ts"
Cohesion: 0.12
Nodes (17): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+9 more)

### Community 73 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (8): claude(), clearFixture(), copilot(), disk, event(), fixtures, releases, sdkSession()

### Community 74 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 75 - "normalizeKnowledgeRelativePath"
Cohesion: 0.22
Nodes (15): joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath(), slashPath(), scopedKnowledgeRoot(), KnowledgeRootChoice (+7 more)

### Community 76 - "server/side-question.ts"
Cohesion: 0.20
Nodes (10): SIDE_QUESTION_CLEANUP_MS, SIDE_QUESTION_RUNTIME_IDLE_MS, SIDE_QUESTION_TIMEOUT_MS, sideQuestionBoundary(), SideQuestionError, sideQuestionPrompt(), withSideQuestionTimeout(), SIDE_QUESTION_EARLIER_ANSWER_MAX_LENGTH (+2 more)

### Community 77 - "manager-context.ts"
Cohesion: 0.21
Nodes (14): ago(), attentionRank(), buildTurnContext(), changeLines(), clock(), MANAGER_SYSTEM_PROMPT, managerPrompt(), oneLine() (+6 more)

### Community 78 - "use-session-knowledge-root.ts"
Cohesion: 0.21
Nodes (12): getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey(), knowledgePositionForBinding(), SessionIdentity (+4 more)

### Community 79 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 80 - "workspace-fixtures.ts"
Cohesion: 0.16
Nodes (14): CONTEXT_EXAMPLE, documents, FIXTURE_NOW, fixtureBackgroundTasks, fixtureEndpoints, fixtureKnowledgeListings, fixtureKnowledgePositions, fixtureKnowledgeRoots (+6 more)

### Community 81 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 82 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 83 - "check-workspace-review-regressions.ts"
Cohesion: 0.14
Nodes (12): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+4 more)

### Community 84 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 86 - "capture-workbench-review.ts"
Cohesion: 0.17
Nodes (10): frame(), geometry, output, scratch, screenshot(), { values }, fixtureSessions, IDLE_SESSION_ID (+2 more)

### Community 87 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 88 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 89 - "registerSessionKnowledgeRoutes"
Cohesion: 0.33
Nodes (11): registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession(), recordReplacement() (+3 more)

### Community 90 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 91 - "shell-notifications.ts"
Cohesion: 0.26
Nodes (10): key(), label(), NotifiableSession, notificationState(), requestId(), SessionNotificationState, ShellNotificationContext, shellNotifications() (+2 more)

### Community 92 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+4 more)

### Community 93 - "promotion-monitor.test.ts"
Cohesion: 0.30
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 94 - "push-notification-service.ts"
Cohesion: 0.17
Nodes (9): PushSender, PushState, directories, RFC-8030, RFC-8030, sessionMuteSchema, subscriptionSchema, testNotificationSchema (+1 more)

### Community 95 - "recovery-seed-guards.test.ts"
Cohesion: 0.18
Nodes (8): bootLegacy(), directories, execute, pending, releases, SeedState, services, stores

### Community 96 - "session-resource-clear.test.ts"
Cohesion: 0.18
Nodes (11): apps, directories, directory(), obstructUploads(), pairedFixture(), providers, seed(), sockets (+3 more)

### Community 97 - "NewSessionDialog"
Cohesion: 0.27
Nodes (12): listDirectories(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), computerProviders(), DefaultSessionFolderControl(), browse(), chooseFolder() (+4 more)

### Community 98 - "BackgroundTasksDialog.tsx"
Cohesion: 0.27
Nodes (9): BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive(), taskStatusLabel() (+1 more)

### Community 99 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 100 - "ManagerSdkSession"
Cohesion: 0.20
Nodes (4): ManagerSdkSession, fail(), FakeSession, reply()

### Community 101 - "session-knowledge-routes.ts"
Cohesion: 0.18
Nodes (6): Lineage, RegistrationGeneration, ReplacementEvidence, SessionKnowledgeLifecycle, sessionParams, updateSchema

### Community 102 - "session-response-order.ts"
Cohesion: 0.33
Nodes (9): carrySnapshotTranscripts(), currentSessionEventSequence(), nextSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences, sessionResponseStartedAt(), failure (+1 more)

### Community 103 - "setupWorkspaceFixture"
Cohesion: 0.24
Nodes (6): pageFor(), createWorkspaceFixtureState(), fixtureBaseUrl(), fixtureValue(), setupWorkspaceFixture(), fixtureApi()

### Community 104 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 107 - "session-enqueue-clear.test.ts"
Cohesion: 0.29
Nodes (9): disk, EnqueueCase, fixtures, gate(), holdEnqueue(), joinedEnqueue(), quiet(), releases (+1 more)

### Community 108 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 109 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 110 - "KnowledgePosition"
Cohesion: 0.33
Nodes (5): WorkspaceFixtureOptions, KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 111 - "node:fs/promises"
Cohesion: 0.25
Nodes (6): disk, fixtures, prompt(), ready(), releases, session()

### Community 112 - "session-resource-transport.ts"
Cohesion: 0.36
Nodes (7): readClaudeMcp(), readCopilotResource(), copilotTransport(), disposals, Frame, write(), unavailable()

### Community 113 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, packageManager, private, type, version

### Community 114 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 115 - "render-workspace-gifs.ts"
Cohesion: 0.29
Nodes (6): directory, { values }, workflows, pnpm, onlyBuiltDependencies, ffmpeg-static

### Community 117 - "recovery-context.ts"
Cohesion: 0.38
Nodes (4): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief

### Community 118 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 119 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 120 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 127 - "MermaidDiagram.tsx"
Cohesion: 0.67
Nodes (3): drawDiagram(), drawing, MermaidDiagram()

## Knowledge Gaps
- **727 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+722 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1112 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **25 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `SessionDetail` to `SessionStore`, `directory-browser.ts`, `.sendAdmittedWithBackend`, `contracts.ts`, `background-task-adapter.ts`, `server/side-question.ts`, `agent-service.ts`, `computer-manager.ts`, `queued-dispatch.test.ts`, `.get`, `agent-service.test.ts`, `.discoverTerminalSessions`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `RemoteNodeClient` connect `RemoteNodeClient` to `FakeSessionService`, `contracts.ts`, `ManagedSession`, `computer-manager.ts`, `session-knowledge-routes.test.ts`, `remote-node-client.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionStore` to `.get`, `SessionDetail`, `ClaudeAgentService`, `.sendAdmittedWithBackend`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _727 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.023100303951367782 - nodes in this community are weakly interconnected._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.0380952380952381 - nodes in this community are weakly interconnected._
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
