# Agentic Remote - Graphify code map

Snapshot: `b50bdeb7413bc78ef8c3b7190e483ff37b5c238f5f1de3da318d4be00a046ce1`

Source checkout: `a6b4c16772605b0bb1c78ad7fb8011988da13be1`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 278 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 278 files · ~570,210 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 4274 nodes · 12089 edges · 172 communities (130 shown, 27 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 829 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- SessionStore
- App
- App.tsx
- SessionDetail
- App.test.tsx
- .sendAdmittedWithBackend
- AgentService
- claude-agent-service.ts
- terminal-session.ts
- CopilotClientLike
- agentic-remote-promotion-monitor
- contracts.ts
- submitMessage
- sessionKey
- active-sessions.ts
- manager-agent.ts
- .get
- markdown-navigation.ts
- RemoteNodeClient
- ManagerAgent
- manager-tools.ts
- TmuxTerminalSessionController
- .drainNextTerminalPrompt
- session-resource-clear.test.ts
- agent-service.ts
- terminal-startup-queue.test.ts
- ComputerManager
- ProviderSessionService
- manager-store.ts
- bundle
- pwa.ts
- FakeSessionService
- SessionService
- ManagerAssistant.tsx
- lib.rs
- shell.ts
- workspace-fixtures.ts
- agentic-remote-promotion-setup
- config.rs
- hub-routes.ts
- api.ts
- terminal-session.test.ts
- devDependencies
- .sendInternal
- agentic-remote
- node-routes.ts
- dependencies
- HubEvent
- SessionOrderStore
- AgentProvider
- recordValue
- delegated-transcription-service.ts
- session-patch-browser.ts
- KnowledgeStore
- background-task-adapter.ts
- cli-canary.ts
- scripts
- SessionKnowledgeStore
- ManagerStore
- compilerOptions
- transcription-service.ts
- app.ts
- directory-browser.ts
- ManagedSession
- PushNotificationService
- session-store-providers.test.ts
- capture-workspace.ts
- use-oracle-settings.ts
- startup-phases.test.ts
- manager-routes.ts
- session-clear-transcript.test.ts
- session-reply-durability.test.ts
- PromptCards.tsx
- knowledge-tree.ts
- compilerOptions
- ComputerSummary
- SessionKnowledgeBinding
- compilerOptions
- compilerOptions
- recordValue
- event-log.ts
- ManagerMemory
- workspace-browser.ts
- normalizeKnowledgeRelativePath
- NodeIdentityStore
- session-knowledge-store.ts
- session-latency-benchmark.ts
- server/side-question.ts
- backgroundTasksFromEvents
- ReaderWorkspace
- terminal-form-deadline.test.ts
- recovery-resend-durability.test.ts
- check-workspace-review-regressions.ts
- background-task-stop.test.ts
- NewSessionDialog
- BackgroundTasksDialog.tsx
- capture
- desktop.json
- react
- agent-service.test.ts
- queued-dispatch.test.ts
- submission-error.ts
- .oxlintrc.json
- settings-local.json
- promotion-monitor.test.ts
- registerSessionKnowledgeRoutes
- TranscriptionError
- scripts
- session-knowledge-routes.test.ts
- background-task-tracker.ts
- push-notification-service.ts
- html-preview.ts
- .claimFailure
- session-knowledge-routes.ts
- generate-pwa-icons.ts
- DeferredSession
- SessionPublications
- bridge.rs
- screenshot-stability.test.ts
- KnowledgePosition
- promotion-setup-execution.test.ts
- remote-node-client.test.ts
- session-knowledge-store.test.ts
- session-resource-transport.ts
- session-store-durability.test.ts
- deleteSession
- package.json
- release-publication.test.ts
- render-workspace-gifs.ts
- history-projection.test.ts
- recovery-context.ts
- settings.ts
- composer-layout.test.ts
- .attach
- saveEdit
- usePanelWidth
- MarkdownCodeBlock.tsx
- hub-routes.test.ts
- hasRunningBackgroundAgent
- FakeRecorder
- FakeRecorder
- .discoverTerminalSessions
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
1. `SessionDetail` - 283 edges
2. `App()` - 260 edges
3. `AgentService` - 250 edges
4. `SessionStore` - 168 edges
5. `ClaudeAgentService` - 120 edges
6. `ManagedSession` - 96 edges
7. `ComputerManager` - 83 edges
8. `registerHubRoutes()` - 83 edges
9. `SessionService` - 72 edges
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

## Communities (172 total, 27 thin omitted)

### Community 0 - "SessionStore"
Cohesion: 0.04
Nodes (57): fixture(), restart(), fixture(), connect(), createStore(), deferred(), disk, enqueue() (+49 more)

### Community 1 - "App"
Cohesion: 0.03
Nodes (101): askSession(), clearConversation(), listKnowledgeEntries(), moveSessionToTmux(), readKnowledgeFile(), recoverConversation(), replyPermission(), replyUserInput() (+93 more)

### Community 2 - "App.tsx"
Cohesion: 0.03
Nodes (88): ActivityStatus, AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph() (+80 more)

### Community 3 - "SessionDetail"
Cohesion: 0.06
Nodes (4): ClaudeAgentService, isMissingClaudeSessionError(), copilotRequest(), SessionDetail

### Community 4 - "App.test.tsx"
Cohesion: 0.03
Nodes (78): addKnowledgeRoot(), bootstrapSessionOrder(), cancelBackgroundTask(), cancelSession(), configureRuntime(), dispatchQueuedPrompt(), fetchSessionOrder(), getProviderRuntimeOptions() (+70 more)

### Community 5 - ".sendAdmittedWithBackend"
Cohesion: 0.05
Nodes (22): acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight(), preparePrompt(), queueConflict() (+14 more)

### Community 6 - "AgentService"
Cohesion: 0.05
Nodes (8): AgentService, persistedFormAnswer(), removeCopilotSessionFiles(), RuntimeConfigurationError, TerminalFormContinuation, fixture(), TerminalFormReplyError, UserInputReplyInput

### Community 7 - "claude-agent-service.ts"
Cohesion: 0.06
Nodes (62): ActiveClaudeQuery, AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput (+54 more)

### Community 8 - "terminal-session.ts"
Cohesion: 0.05
Nodes (71): boxedComposerFrame(), captureTerminal(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFocusWitnessed(), composerFrameText(), composerHasFocus(), composerRowText() (+63 more)

### Community 9 - "CopilotClientLike"
Cohesion: 0.03
Nodes (41): CopilotClientLike, CopilotSessionLike, holdProbe(), fixtures, gate(), releases, directories, fakeClient() (+33 more)

### Community 10 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (71): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+63 more)

### Community 11 - "contracts.ts"
Cohesion: 0.08
Nodes (48): managers, releases, remote, RegisteredComputer, RegistryState, directories, StoredNodeIdentity, ProviderSessionServiceEvents (+40 more)

### Community 12 - "submitMessage"
Cohesion: 0.07
Nodes (66): reorderQueuedPrompts(), updateQueuedPrompt(), activeComposerPastes(), appendComposerForKey(), applySession(), askAboutKnowledgeFile(), cancelQueuedPromptEdit(), composerChanged() (+58 more)

### Community 13 - "sessionKey"
Cohesion: 0.07
Nodes (53): saveSessionOrderLane(), handleDragEnd(), RenameSessionDialog(), KnowledgeRootSelector(), root, reorderSessionLaneWithHiddenFollowers(), SessionFilter, sessionNavigationView (+45 more)

### Community 14 - "active-sessions.ts"
Cohesion: 0.06
Nodes (51): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates(), isCopilotProcess() (+43 more)

### Community 15 - "manager-agent.ts"
Cohesion: 0.05
Nodes (32): ManagerEventSource, discover(), isPending(), isQueued(), ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig (+24 more)

### Community 17 - "markdown-navigation.ts"
Cohesion: 0.07
Nodes (46): executeCommand(), listWorkspace(), searchWorkspace(), moveSessionToBrowsedFolder(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink() (+38 more)

### Community 18 - "RemoteNodeClient"
Cohesion: 0.05
Nodes (8): RemoteResync, RemoteSessionRead, headerSafe(), RemoteNodeClient, BackgroundTaskSnapshot, NodeInfo, WorkspaceFile, WorkspaceListing

### Community 19 - "ManagerAgent"
Cohesion: 0.10
Nodes (9): checkContent(), delay(), errorMessage(), isNotFound(), ManagerAgent, TurnError, withTimeout(), ManagerSkillSummary (+1 more)

### Community 20 - "manager-tools.ts"
Cohesion: 0.07
Nodes (29): APPROVE_WORDS, computerField, createManagerTools(), define(), deliver(), requireComputer(), resolveSession(), trustFolder() (+21 more)

### Community 21 - "TmuxTerminalSessionController"
Cohesion: 0.11
Nodes (14): copilotCommand(), endProbeSession(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand(), safeWindowName(), submitTerminalForm() (+6 more)

### Community 22 - ".drainNextTerminalPrompt"
Cohesion: 0.09
Nodes (3): httpBoundary(), TranscriptObservation, StartupPhases

### Community 23 - "session-resource-clear.test.ts"
Cohesion: 0.06
Nodes (42): ClaudeSdk, cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle(), disk (+34 more)

### Community 24 - "agent-service.ts"
Cohesion: 0.05
Nodes (42): AcceptedSdkReply, ActivePrompt, activityResult(), AgentServiceEvents, ansiSequence, commandShortcut(), CreationRuntime, DeliveryBoundary (+34 more)

### Community 25 - "terminal-startup-queue.test.ts"
Cohesion: 0.11
Nodes (39): findActiveCopilotSessions(), exec, formFixture(), horizontalFormFixture(), textFieldFormFixture(), directories, exec, deliveryFixture() (+31 more)

### Community 26 - "ComputerManager"
Cohesion: 0.17
Nodes (3): ComputerManager, managedSession(), registerHubRoutes()

### Community 28 - "manager-store.ts"
Cohesion: 0.10
Nodes (28): ManagerAgentOptions, ago(), attentionRank(), buildTurnContext(), changeLines(), clock(), MANAGER_SYSTEM_PROMPT, managerPrompt() (+20 more)

### Community 29 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 30 - "pwa.ts"
Cohesion: 0.09
Nodes (37): directories, AppVersion, parseAppVersion(), deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart() (+29 more)

### Community 31 - "FakeSessionService"
Cohesion: 0.07
Nodes (4): FakeSessionService, routingFixture(), session(), temporaryDirectory()

### Community 33 - "ManagerAssistant.tsx"
Cohesion: 0.09
Nodes (28): ManagerStatus, cancelManager(), removeQueuedManagerMessage(), resetManager(), resolveManagerConfirmation(), retryManagerMessage(), sendManagerMessage(), phoneEnterCreatesNewline() (+20 more)

### Community 34 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 35 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 36 - "workspace-fixtures.ts"
Cohesion: 0.08
Nodes (30): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, createWorkspaceFixtureState() (+22 more)

### Community 37 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 38 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 39 - "hub-routes.ts"
Cohesion: 0.06
Nodes (37): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+29 more)

### Community 40 - "api.ts"
Cohesion: 0.10
Nodes (32): AddKnowledgeRootInput, ManagedSessionMcpServersSnapshot, ManagedSessionSkillsSnapshot, PushSettings, SessionMcpServerSummary, SessionResourceSource, SessionSkillSummary, UpdateSessionKnowledgeRootInput (+24 more)

### Community 41 - "terminal-session.test.ts"
Cohesion: 0.08
Nodes (31): composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), occurrences(), paneEvidenceCount(), paneShowsText(), parseTerminalUpdateNotice() (+23 more)

### Community 42 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 43 - ".sendInternal"
Cohesion: 0.16
Nodes (25): activeBottomFrame(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), containsCopiedInteractiveFrame(), desktopInstallPromptIdentity(), findTerminalWrappedText(), hasLiveTerminalComposer() (+17 more)

### Community 44 - "agentic-remote"
Cohesion: 0.13
Nodes (31): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+23 more)

### Community 45 - "node-routes.ts"
Cohesion: 0.07
Nodes (29): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile(), AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER (+21 more)

### Community 46 - "dependencies"
Cohesion: 0.06
Nodes (33): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, @fastify/multipart, @fastify/static, @fastify/websocket, lucide-react (+25 more)

### Community 47 - "HubEvent"
Cohesion: 0.12
Nodes (17): Connection, ComputerManagerEvents, Client, diffMessages(), PatchSocket, Publication, sameMessage(), SessionUpserted (+9 more)

### Community 48 - "SessionOrderStore"
Cohesion: 0.15
Nodes (13): start(), directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey() (+5 more)

### Community 49 - "AgentProvider"
Cohesion: 0.09
Nodes (15): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription (+7 more)

### Community 50 - "recordValue"
Cohesion: 0.14
Nodes (26): activityDuration(), activityGroupIdFor(), activityKind(), ActivityToolStart, contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength() (+18 more)

### Community 51 - "delegated-transcription-service.ts"
Cohesion: 0.11
Nodes (14): BuildAppOptions, collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation (+6 more)

### Community 52 - "session-patch-browser.ts"
Cohesion: 0.14
Nodes (25): advance(), connections, content(), FrameMeasurement, instrument(), lastHeading(), message(), open() (+17 more)

### Community 53 - "KnowledgeStore"
Cohesion: 0.16
Nodes (8): WorkspaceFixtureState, KnowledgeRootReservation, KnowledgeState, KnowledgeStore, directories, fixture(), createHub(), KnowledgeRoot

### Community 54 - "background-task-adapter.ts"
Cohesion: 0.10
Nodes (24): BackgroundTaskEventOptions, CopilotClientTaskInfo, CopilotClientTaskProgress, CopilotTaskInfo, CopilotTaskProgress, isBackgroundTaskInfo(), isBackgroundTaskProgress(), isLiveTaskStatus() (+16 more)

### Community 55 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 56 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 57 - "SessionKnowledgeStore"
Cohesion: 0.16
Nodes (5): bindingKey(), SessionKnowledgeRecoveryError, SessionKnowledgeStore, stateSchema, stateWithPaths()

### Community 58 - "ManagerStore"
Cohesion: 0.14
Nodes (4): openStore(), emptyState(), ManagerStore, open()

### Community 59 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 60 - "transcription-service.ts"
Cohesion: 0.11
Nodes (19): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+11 more)

### Community 61 - "app.ts"
Cohesion: 0.14
Nodes (16): prefixes, session, trusted, untrusted, buildApp(), errorStatusCode(), isAppleTouchIconProbe(), transcriptionComputerName() (+8 more)

### Community 62 - "directory-browser.ts"
Cohesion: 0.19
Nodes (12): DirectoryScope, displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin() (+4 more)

### Community 63 - "ManagedSession"
Cohesion: 0.18
Nodes (4): RemoteSessionListing, ManagerHub, ManagedSession, SessionListing

### Community 64 - "PushNotificationService"
Cohesion: 0.25
Nodes (3): brief(), PushNotificationService, registerPushRoutes()

### Community 65 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (11): claude(), clearFixture(), copilot(), disk, event(), fixture(), fixtures, holdOtherWrite() (+3 more)

### Community 66 - "capture-workspace.ts"
Cohesion: 0.20
Nodes (20): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+12 more)

### Community 67 - "use-oracle-settings.ts"
Cohesion: 0.16
Nodes (13): RuntimeModelOption, getManager(), updateManagerSettings(), effortFrom(), efforts, OracleModelSettings(), OracleSettingsStatus(), HarnessProps (+5 more)

### Community 68 - "startup-phases.test.ts"
Cohesion: 0.12
Nodes (12): phases, port, createStartupPhases(), startManagedServer(), StartupPhaseEvent, StartupPhaseRecord, address, directories (+4 more)

### Community 69 - "manager-routes.ts"
Cohesion: 0.15
Nodes (11): confirmationSchema, defaultsSchema, editSchema, effort, managerInputError(), ManagerRouteAgent, messageParams, registerManagerRoutes() (+3 more)

### Community 70 - "session-clear-transcript.test.ts"
Cohesion: 0.11
Nodes (9): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions, disk, fixtures, gate(), holdTurnWrite() (+1 more)

### Community 71 - "session-reply-durability.test.ts"
Cohesion: 0.17
Nodes (17): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRunFixture() (+9 more)

### Community 72 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (19): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+11 more)

### Community 73 - "knowledge-tree.ts"
Cohesion: 0.17
Nodes (18): WorkspaceEntry, knowledgeTreeKeyDown(), toggleKnowledgeFolder(), collapseKnowledgeFolder(), expandKnowledgeFolder(), knowledgeAncestors(), KnowledgeCrumb, knowledgeCrumbs() (+10 more)

### Community 74 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 75 - "ComputerSummary"
Cohesion: 0.17
Nodes (5): fixture(), session(), sessionAtLeastAsNew(), TurnContextInput, ComputerSummary

### Community 76 - "SessionKnowledgeBinding"
Cohesion: 0.18
Nodes (14): SessionKnowledgeEvents, SessionKnowledgeBinding, getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey() (+6 more)

### Community 77 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 78 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 79 - "recordValue"
Cohesion: 0.18
Nodes (19): attachmentModeValue(), backgroundHandoff(), booleanValue(), eventString(), lastForegroundCompletionAt(), normalizedToolName(), notificationKind(), parsedValue() (+11 more)

### Community 80 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 81 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 82 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 83 - "normalizeKnowledgeRelativePath"
Cohesion: 0.22
Nodes (15): joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath(), slashPath(), scopedKnowledgeRoot(), KnowledgeRootChoice (+7 more)

### Community 84 - "NodeIdentityStore"
Cohesion: 0.18
Nodes (4): ComputerRegistry, directories, remoteSnapshotFixture(), NodeIdentityStore

### Community 85 - "session-knowledge-store.ts"
Cohesion: 0.12
Nodes (16): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+8 more)

### Community 86 - "session-latency-benchmark.ts"
Cohesion: 0.24
Nodes (16): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+8 more)

### Community 87 - "server/side-question.ts"
Cohesion: 0.22
Nodes (10): SIDE_QUESTION_CLEANUP_MS, SIDE_QUESTION_RUNTIME_IDLE_MS, SIDE_QUESTION_TIMEOUT_MS, sideQuestionBoundary(), SideQuestionError, sideQuestionPrompt(), withSideQuestionTimeout(), SIDE_QUESTION_EARLIER_ANSWER_MAX_LENGTH (+2 more)

### Community 88 - "backgroundTasksFromEvents"
Cohesion: 0.27
Nodes (17): addActivity(), backgroundTasksFromEvents(), boundedText(), errorValue(), eventTask(), executionModeValue(), isTerminalTaskStatus(), mergeShellRefresh() (+9 more)

### Community 89 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 90 - "terminal-form-deadline.test.ts"
Cohesion: 0.15
Nodes (12): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+4 more)

### Community 91 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 92 - "check-workspace-review-regressions.ts"
Cohesion: 0.14
Nodes (12): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+4 more)

### Community 93 - "background-task-stop.test.ts"
Cohesion: 0.23
Nodes (12): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), started() (+4 more)

### Community 94 - "NewSessionDialog"
Cohesion: 0.22
Nodes (15): provider(), activateSession(), createSession(), listDirectories(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), computerProviders() (+7 more)

### Community 95 - "BackgroundTasksDialog.tsx"
Cohesion: 0.22
Nodes (11): BackgroundTask, DialogFrame(), BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel() (+3 more)

### Community 96 - "capture"
Cohesion: 0.20
Nodes (14): releaseRecording(), shortcutKeys(), stopRecording(), binding(), bindingLabel(), capturableCode(), isModifierCode(), keyLabel() (+6 more)

### Community 97 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 98 - "react"
Cohesion: 0.22
Nodes (8): react, transcribeAudio(), drawDiagram(), drawing, MermaidDiagram(), SessionActions(), recordingDuration(), useVoiceRecorder()

### Community 99 - "agent-service.test.ts"
Cohesion: 0.18
Nodes (11): foregroundTurnOpen(), isForegroundCompletionEvent(), isForegroundLifecycleEvent(), statusFromEvents(), terminalFormSteps(), configurableModel(), directories, services (+3 more)

### Community 100 - "queued-dispatch.test.ts"
Cohesion: 0.15
Nodes (7): deferred(), disk, fixtures, holdWrite(), prompt(), releases, target

### Community 101 - "submission-error.ts"
Cohesion: 0.25
Nodes (9): RemoteNodeRedirectError, RemoteNodeRequestError, httpDeliveryUncertain(), legacyDefinitiveHttpRefusals, parseSubmissionReceipt(), SubmissionError, SubmissionReceipt, submissionReceiptFromError() (+1 more)

### Community 102 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 103 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 104 - "promotion-monitor.test.ts"
Cohesion: 0.27
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 105 - "registerSessionKnowledgeRoutes"
Cohesion: 0.33
Nodes (11): registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession(), recordReplacement() (+3 more)

### Community 106 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 107 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+4 more)

### Community 108 - "session-knowledge-routes.test.ts"
Cohesion: 0.18
Nodes (9): ServerRole, SessionMetadataLookup, disk, FakeManager, fixtures, gate(), holdWrite(), releases (+1 more)

### Community 109 - "background-task-tracker.ts"
Cohesion: 0.27
Nodes (6): snapshot(), backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint()

### Community 110 - "push-notification-service.ts"
Cohesion: 0.17
Nodes (9): PushSender, PushState, directories, RFC-8030, RFC-8030, sessionMuteSchema, subscriptionSchema, testNotificationSchema (+1 more)

### Community 111 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 113 - "session-knowledge-routes.ts"
Cohesion: 0.18
Nodes (6): Lineage, RegistrationGeneration, ReplacementEvidence, SessionKnowledgeLifecycle, sessionParams, updateSchema

### Community 114 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 117 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 118 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 119 - "KnowledgePosition"
Cohesion: 0.33
Nodes (5): WorkspaceFixtureOptions, KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 120 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 121 - "remote-node-client.test.ts"
Cohesion: 0.28
Nodes (5): client(), servers, session, TERMINAL_REQUEST_TIMEOUT_MS, TERMINAL_STARTUP_TIMEOUT_MS

### Community 122 - "session-knowledge-store.test.ts"
Cohesion: 0.25
Nodes (6): SessionKnowledgeConflictError, disk, fixture(), fixtures, releases, root()

### Community 123 - "session-resource-transport.ts"
Cohesion: 0.36
Nodes (7): readClaudeMcp(), readCopilotResource(), copilotTransport(), disposals, Frame, write(), unavailable()

### Community 124 - "session-store-durability.test.ts"
Cohesion: 0.31
Nodes (7): disk, fixture(), fixtures, prompt(), ready(), releases, session()

### Community 125 - "deleteSession"
Cohesion: 0.28
Nodes (9): addComputer(), deleteKnowledgeRoot(), deleteSession(), removeComputer(), requestVoid(), removeRoot(), ComputersDialog(), remove() (+1 more)

### Community 126 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, packageManager, private, type, version

### Community 127 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 128 - "render-workspace-gifs.ts"
Cohesion: 0.29
Nodes (6): directory, { values }, workflows, pnpm, onlyBuiltDependencies, ffmpeg-static

### Community 129 - "history-projection.test.ts"
Cohesion: 0.33
Nodes (5): eventsFor(), ModelMessage, random(), seedOffset, terminalTypes

### Community 130 - "recovery-context.ts"
Cohesion: 0.38
Nodes (4): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief

### Community 131 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 132 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 134 - "saveEdit"
Cohesion: 0.40
Nodes (6): editQueuedManagerMessage(), announce(), cancelEdit(), onEditKeyDown(), returnFocusToEdit(), saveEdit()

### Community 135 - "usePanelWidth"
Cohesion: 0.47
Nodes (6): boundWidth(), readWidth(), storeWidth(), usePanelWidth(), commit(), finish()

### Community 136 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

## Knowledge Gaps
- **766 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+761 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1190 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **27 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `SessionStore` connect `SessionStore` to `SessionDetail`, `.sendAdmittedWithBackend`, `AgentService`, `.get`, `.drainNextTerminalPrompt`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `AgentService` connect `AgentService` to `SessionStore`, `SessionDetail`, `agent-service.test.ts`, `.sendAdmittedWithBackend`, `claude-agent-service.ts`, `.discoverTerminalSessions`, `.get`, `.claimFailure`, `recordValue`, `.drainNextTerminalPrompt`, `server/side-question.ts`, `background-task-adapter.ts`, `ProviderSessionService`, `directory-browser.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `ClaudeAgentService` connect `SessionDetail` to `SessionStore`, `SessionService`, `use-oracle-settings.ts`, `.sendAdmittedWithBackend`, `claude-agent-service.ts`, `contracts.ts`, `.drainNextTerminalPrompt`, `ProviderSessionService`, `directory-browser.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _766 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `SessionStore` be split into smaller, more focused modules?**
  _Cohesion score 0.035349383440986495 - nodes in this community are weakly interconnected._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.03276003276003276 - nodes in this community are weakly interconnected._
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
