# Agentic Remote - Graphify code map

Snapshot: `b768c11dce7e26dc8bde7fb08cf8d5aa3bedb599e8a6ae33f6d1f680a61904f4`

Source checkout: `7b64edb96cca168fa79c03557b6bbc81c0ba7aa1`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 262 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 262 files · ~529,890 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 4028 nodes · 11392 edges · 159 communities (124 shown, 20 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 785 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- SessionStore
- ClaudeAgentService
- App.tsx
- App
- App.test.tsx
- api.ts
- terminal-session.ts
- queued-dispatch.test.ts
- agentic-remote-promotion-monitor
- contracts.ts
- session-resources.ts
- TmuxTerminalSessionController
- submitMessage
- active-sessions.ts
- markdown-navigation.ts
- session-presentation.ts
- SessionService
- agent-service.ts
- CopilotClientLike
- ManagerAgent
- hub-routes.ts
- terminal-startup-queue.test.ts
- ComputerManager
- RemoteNodeClient
- manager-store.ts
- ProviderSessionService
- bundle
- manager.ts
- pwa.ts
- lib.rs
- agentic-remote-promotion-setup
- config.rs
- SessionDetail
- manager-agent.ts
- manager-tools.ts
- FakeSessionService
- devDependencies
- agentic-remote
- dependencies
- app.ts
- .sendInternal
- SessionOrderStore
- terminal-session.test.ts
- transcription-service.ts
- background-task-adapter.ts
- ManagedSession
- computer-manager-metadata.test.ts
- cli-canary.ts
- SessionKnowledgeStore
- scripts
- shell.ts
- ManagerStore
- KnowledgeStore
- .createSession
- directory-browser.ts
- session-resource-clear.test.ts
- compilerOptions
- .handleSessionEvent
- node-routes.ts
- agent-service.test.ts
- PushNotificationService
- session-knowledge-routes.ts
- session-knowledge-store.ts
- delegated-transcription-service.ts
- ComputerSummary
- capture-workspace.ts
- startup-phases.test.ts
- session-clear-transcript.test.ts
- PromptCards.tsx
- knowledge-tree.ts
- compilerOptions
- compilerOptions
- check-workspace-review-regressions.ts
- terminal-form-deadline.test.ts
- compilerOptions
- event-log.ts
- ManagerMemory
- session-store-providers.test.ts
- workspace-browser.ts
- SessionKnowledgeBinding
- recordValue
- session-response-order.ts
- manager-routes.ts
- push-notification-service.ts
- session-reply-durability.test.ts
- ReaderWorkspace
- backgroundTasksFromEvents
- background-task-stop.test.ts
- NewSessionDialog
- recovery-resend-durability.test.ts
- session-resource-routes.test.ts
- capture
- session-resource-providers.test.ts
- workspace-fixtures.ts
- desktop.json
- TranscriptionError
- BackgroundTasksDialog.tsx
- capture-workbench-review.ts
- .oxlintrc.json
- settings-local.json
- .discoverSessions
- promotion-monitor.test.ts
- shell-notifications.ts
- scripts
- background-task-tracker.ts
- recovery-seed-guards.test.ts
- html-preview.ts
- server/side-question.ts
- KnowledgeRootChoices.test.tsx
- SessionResources.tsx
- setupWorkspaceFixture
- generate-pwa-icons.ts
- DeferredSession
- bridge.rs
- deleteSession
- screenshot-stability.test.ts
- promotion-setup-execution.test.ts
- package.json
- release-publication.test.ts
- KnowledgePosition
- render-workspace-gifs.ts
- recovery-context.ts
- settings.ts
- composer-layout.test.ts
- MarkdownCodeBlock.tsx
- hub-routes.test.ts
- SessionKnowledgeLifecycle
- terminal-send-uncertainty.test.ts
- MermaidDiagram.tsx
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

## Communities (159 total, 20 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.05
Nodes (10): agentMode(), AgentService, isMissingSessionError(), isUncertainDelivery(), removeCopilotSessionFiles(), statusFromEvents(), queueConflict(), TerminalSessionController (+2 more)

### Community 1 - "SessionStore"
Cohesion: 0.03
Nodes (60): fixture(), fixture(), connect(), createStore(), deferred(), disk, enqueue(), fixture() (+52 more)

### Community 2 - "ClaudeAgentService"
Cohesion: 0.04
Nodes (17): ClaudeAgentService, isClaudeAuthenticationError(), isMissingClaudeSessionError(), cleanupFixtures(), directories, fixture(), queryHandle(), services (+9 more)

### Community 3 - "App.tsx"
Cohesion: 0.03
Nodes (90): ActivityStatus, AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph() (+82 more)

### Community 4 - "App"
Cohesion: 0.04
Nodes (99): listKnowledgeEntries(), readKnowledgeFile(), replyPermission(), saveSessionOrderLane(), saveSessionVisibility(), App(), appendComposerForKey(), appKeyDown() (+91 more)

### Community 5 - "App.test.tsx"
Cohesion: 0.04
Nodes (73): addKnowledgeRoot(), askSession(), bootstrapSessionOrder(), cancelBackgroundTask(), cancelSession(), configureRuntime(), fetchSessionOrder(), getPushSettings() (+65 more)

### Community 6 - "api.ts"
Cohesion: 0.05
Nodes (58): TerminalFormContinuation, RemoteResync, RemoteSessionRead, DEFINITE_DISPATCH_REFUSALS, headerSafe(), normalizeNodeUrl(), REDIRECT_STATUSES, client() (+50 more)

### Community 7 - "terminal-session.ts"
Cohesion: 0.05
Nodes (69): boxedComposerFrame(), captureTerminal(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFocusWitnessed(), composerFrameText(), composerHasFocus(), composerHoldsOtherText() (+61 more)

### Community 8 - "queued-dispatch.test.ts"
Cohesion: 0.05
Nodes (30): acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight(), preparePrompt(), QueuedDelivery (+22 more)

### Community 9 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (71): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+63 more)

### Community 10 - "contracts.ts"
Cohesion: 0.07
Nodes (36): AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, execFileAsync, PendingClaudeInput, PendingClaudePermission, directories, ProviderSessionServiceEvents (+28 more)

### Community 11 - "session-resources.ts"
Cohesion: 0.10
Nodes (41): ClaudeResources, claudeMcp(), claudeSkillNames(), copilotMcp, copilotSkills, copilotWorkspaceMcp, CopilotWorkspaceSkills, count() (+33 more)

### Community 12 - "TmuxTerminalSessionController"
Cohesion: 0.09
Nodes (21): copilotCommand(), endProbeSession(), execFileAsync, hasClippedTerminalFormTabs(), parseTerminalFormActiveField(), parseTerminalUpdateNotice(), processAncestors(), processCommand() (+13 more)

### Community 13 - "submitMessage"
Cohesion: 0.08
Nodes (58): reorderQueuedPrompts(), updateQueuedPrompt(), activeComposerPastes(), applySession(), cancelQueuedPromptEdit(), composerChanged(), composerKeyDown(), composerPasted() (+50 more)

### Community 14 - "active-sessions.ts"
Cohesion: 0.07
Nodes (48): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+40 more)

### Community 15 - "markdown-navigation.ts"
Cohesion: 0.07
Nodes (44): executeCommand(), listWorkspace(), moveSessionToBrowsedFolder(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink(), KnowledgeReader() (+36 more)

### Community 16 - "session-presentation.ts"
Cohesion: 0.08
Nodes (45): react, SessionExecutionMode, KnowledgeRootSelector(), root, SessionFilter, sessionNavigationView, attentionRank, computerTone() (+37 more)

### Community 17 - "SessionService"
Cohesion: 0.07
Nodes (10): ActiveClaudeQuery, registerNodeRoutes(), releases, session, snapshot, readServiceResources(), readSessionMcpServers(), ResourceReads (+2 more)

### Community 18 - "agent-service.ts"
Cohesion: 0.04
Nodes (49): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), ActivityToolStart, AgentServiceEvents, ansiSequence, commandShortcut() (+41 more)

### Community 19 - "CopilotClientLike"
Cohesion: 0.05
Nodes (33): CopilotClientLike, holdProbe(), fixtures, gate(), releases, directories, fakeClient(), ForkRequest (+25 more)

### Community 20 - "ManagerAgent"
Cohesion: 0.12
Nodes (8): delay(), errorMessage(), isNotFound(), ManagerAgent, withTimeout(), ManagerSkillSummary, ManagerMessage, ManagerStatus

### Community 21 - "hub-routes.ts"
Cohesion: 0.06
Nodes (46): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+38 more)

### Community 22 - "terminal-startup-queue.test.ts"
Cohesion: 0.09
Nodes (37): exec, formFixture(), horizontalFormFixture(), textFieldFormFixture(), directories, exec, client(), disk (+29 more)

### Community 23 - "ComputerManager"
Cohesion: 0.17
Nodes (3): ComputerManager, managedSession(), registerHubRoutes()

### Community 24 - "RemoteNodeClient"
Cohesion: 0.06
Nodes (6): RemoteNodeClient, hasActiveBackgroundTasks(), BackgroundTaskSnapshot, RemovedQueuedPrompt, WorkspaceFile, WorkspaceListing

### Community 25 - "manager-store.ts"
Cohesion: 0.09
Nodes (28): ago(), attentionRank(), buildTurnContext(), changeLines(), clock(), MANAGER_SYSTEM_PROMPT, managerPrompt(), oneLine() (+20 more)

### Community 27 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 28 - "manager.ts"
Cohesion: 0.08
Nodes (31): ManagerEventSource, isManagerEvent(), MANAGER_MESSAGE_MAX_LENGTH, MANAGER_SNAPSHOT_MESSAGES, ManagerConfirmation, ManagerEvent, ManagerMessageRole, ManagerMessageState (+23 more)

### Community 29 - "pwa.ts"
Cohesion: 0.09
Nodes (37): directories, AppVersion, parseAppVersion(), deletePushSubscription(), getProviderRuntimeOptions(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate() (+29 more)

### Community 30 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 31 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 32 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 33 - "SessionDetail"
Cohesion: 0.12
Nodes (4): persistedFormAnswer(), PendingClaudeReply, SessionDetail, SessionSummary

### Community 34 - "manager-agent.ts"
Cohesion: 0.08
Nodes (17): discover(), ManagerAgentOptions, ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig, Rung, Behavior (+9 more)

### Community 35 - "manager-tools.ts"
Cohesion: 0.10
Nodes (19): computerField, createManagerTools(), define(), requireComputer(), resolveSession(), errorMessage(), failure(), link() (+11 more)

### Community 36 - "FakeSessionService"
Cohesion: 0.08
Nodes (5): FakeSessionService, routingFixture(), session(), temporaryDirectory(), SideQuestionExchange

### Community 37 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 38 - "agentic-remote"
Cohesion: 0.13
Nodes (31): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+23 more)

### Community 39 - "dependencies"
Cohesion: 0.06
Nodes (33): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, @fastify/multipart, @fastify/static, @fastify/websocket, lucide-react (+25 more)

### Community 40 - "app.ts"
Cohesion: 0.10
Nodes (22): prefixes, session, trusted, untrusted, buildApp(), errorStatusCode(), isAppleTouchIconProbe(), transcriptionComputerName() (+14 more)

### Community 41 - ".sendInternal"
Cohesion: 0.20
Nodes (25): activeBottomFrame(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), containsCopiedInteractiveFrame(), desktopInstallPromptIdentity(), findTerminalWrappedText(), hasTerminalCommandPermissionQuestion() (+17 more)

### Community 42 - "SessionOrderStore"
Cohesion: 0.15
Nodes (13): start(), directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey() (+5 more)

### Community 43 - "terminal-session.test.ts"
Cohesion: 0.09
Nodes (23): listTmuxSessions(), terminalChecklistState(), terminalFormCommitKeys(), bracketedTabPane, clearFixture(), deliveryFixture(), desktopInstallPane, directories (+15 more)

### Community 44 - "transcription-service.ts"
Cohesion: 0.09
Nodes (22): registerTranscriptionRoutes(), transcriptionMultipartOptions, AudioUpload, CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner() (+14 more)

### Community 45 - "background-task-adapter.ts"
Cohesion: 0.13
Nodes (26): addActivity(), BackgroundTaskEventOptions, boundedText(), CopilotClientTaskInfo, CopilotClientTaskProgress, CopilotTaskInfo, CopilotTaskProgress, eventTask() (+18 more)

### Community 46 - "ManagedSession"
Cohesion: 0.11
Nodes (13): ServerRole, RemoteSessionListing, SessionMetadataLookup, ManagerHub, disk, FakeManager, fixtures, gate() (+5 more)

### Community 47 - "computer-manager-metadata.test.ts"
Cohesion: 0.11
Nodes (10): managers, releases, remote, ComputerRegistry, RegistryState, directories, remoteSnapshotFixture(), NodeIdentityStore (+2 more)

### Community 48 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 49 - "SessionKnowledgeStore"
Cohesion: 0.15
Nodes (7): SessionKnowledgeRecoveryError, SessionKnowledgeStore, disk, fixture(), fixtures, releases, root()

### Community 50 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 51 - "shell.ts"
Cohesion: 0.15
Nodes (24): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), onShellDeepLink(), onShellNotificationReply(), openShellSettings() (+16 more)

### Community 52 - "ManagerStore"
Cohesion: 0.14
Nodes (4): openStore(), emptyState(), ManagerStore, open()

### Community 53 - "KnowledgeStore"
Cohesion: 0.18
Nodes (7): WorkspaceFixtureState, KnowledgeRootReservation, KnowledgeState, KnowledgeStore, directories, fixture(), KnowledgeRoot

### Community 54 - ".createSession"
Cohesion: 0.12
Nodes (5): RuntimeConfigurationError, fixture(), httpBoundary(), SideQuestionError, withSideQuestionTimeout()

### Community 55 - "directory-browser.ts"
Cohesion: 0.17
Nodes (13): DirectoryScope, displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin() (+5 more)

### Community 56 - "session-resource-clear.test.ts"
Cohesion: 0.11
Nodes (21): apps, directories, directory(), obstructUploads(), pairedFixture(), providerFixture(), providers, seed() (+13 more)

### Community 57 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 58 - ".handleSessionEvent"
Cohesion: 0.22
Nodes (20): activityKind(), activityResult(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), isBackgroundTaskEvent(), isUnsupportedBackgroundTaskError() (+12 more)

### Community 59 - "node-routes.ts"
Cohesion: 0.08
Nodes (23): AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema (+15 more)

### Community 60 - "agent-service.test.ts"
Cohesion: 0.12
Nodes (12): CopilotSessionLike, terminalFormSteps(), configurableModel(), directories, FakeCopilotClient, probeService(), services, startupFifoFixture() (+4 more)

### Community 61 - "PushNotificationService"
Cohesion: 0.24
Nodes (3): brief(), PushNotificationService, registerPushRoutes()

### Community 62 - "session-knowledge-routes.ts"
Cohesion: 0.15
Nodes (17): Lineage, registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession() (+9 more)

### Community 63 - "session-knowledge-store.ts"
Cohesion: 0.10
Nodes (20): bindingKey(), bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor() (+12 more)

### Community 64 - "delegated-transcription-service.ts"
Cohesion: 0.13
Nodes (10): BuildAppOptions, collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation (+2 more)

### Community 65 - "ComputerSummary"
Cohesion: 0.16
Nodes (7): fixture(), session(), sessionAtLeastAsNew(), RegisteredComputer, TurnContextInput, createHub(), ComputerSummary

### Community 66 - "capture-workspace.ts"
Cohesion: 0.20
Nodes (20): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+12 more)

### Community 67 - "startup-phases.test.ts"
Cohesion: 0.12
Nodes (12): phases, port, createStartupPhases(), startManagedServer(), StartupPhaseEvent, StartupPhaseRecord, address, directories (+4 more)

### Community 68 - "session-clear-transcript.test.ts"
Cohesion: 0.11
Nodes (9): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions, disk, fixtures, gate(), holdTurnWrite() (+1 more)

### Community 69 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (19): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+11 more)

### Community 70 - "knowledge-tree.ts"
Cohesion: 0.17
Nodes (18): WorkspaceEntry, knowledgeTreeKeyDown(), toggleKnowledgeFolder(), collapseKnowledgeFolder(), expandKnowledgeFolder(), knowledgeAncestors(), KnowledgeCrumb, knowledgeCrumbs() (+10 more)

### Community 71 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 72 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 73 - "check-workspace-review-regressions.ts"
Cohesion: 0.13
Nodes (15): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+7 more)

### Community 74 - "terminal-form-deadline.test.ts"
Cohesion: 0.12
Nodes (14): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+6 more)

### Community 75 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 76 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 77 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 78 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (8): claude(), clearFixture(), copilot(), disk, event(), fixtures, releases, sdkSession()

### Community 79 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 80 - "SessionKnowledgeBinding"
Cohesion: 0.20
Nodes (13): SessionKnowledgeBinding, getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey(), knowledgePositionForBinding() (+5 more)

### Community 81 - "recordValue"
Cohesion: 0.18
Nodes (18): attachmentModeValue(), backgroundHandoff(), booleanValue(), errorValue(), notificationKind(), parsedValue(), rawTailText(), recordValue() (+10 more)

### Community 82 - "session-response-order.ts"
Cohesion: 0.17
Nodes (16): clearConversation(), recoverConversation(), adoptConversationReplacement(), clearSelectedConversation(), recoverSelectedConversation(), sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts() (+8 more)

### Community 83 - "manager-routes.ts"
Cohesion: 0.18
Nodes (10): WorkspaceFixtureOptions, confirmationSchema, defaultsSchema, effort, ManagerRouteAgent, messageParams, registerManagerRoutes(), sendSchema (+2 more)

### Community 84 - "push-notification-service.ts"
Cohesion: 0.12
Nodes (10): HubEventSource, PushSender, PushState, directories, RFC-8030, RFC-8030, sessionMuteSchema, subscriptionSchema (+2 more)

### Community 85 - "session-reply-durability.test.ts"
Cohesion: 0.18
Nodes (13): assistantFixture(), claudeQuestions(), claudeRunFixture(), copilotFixture(), copilotRunFixture(), disk, fallbackFormFixture(), fixtures (+5 more)

### Community 86 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 87 - "backgroundTasksFromEvents"
Cohesion: 0.19
Nodes (16): backgroundTasksFromEvents(), eventString(), isLiveTaskStatus(), isOlderExecution(), isShellObserverTool(), isShellStopTool(), isShellTool(), isTerminalTaskStatus() (+8 more)

### Community 88 - "background-task-stop.test.ts"
Cohesion: 0.21
Nodes (13): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), snapshot() (+5 more)

### Community 89 - "NewSessionDialog"
Cohesion: 0.20
Nodes (16): provider(), activateSession(), createSession(), listDirectories(), listHistory(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse() (+8 more)

### Community 90 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 91 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 92 - "capture"
Cohesion: 0.18
Nodes (15): releaseRecording(), shortcutKeys(), startRecording(), stopRecording(), binding(), bindingLabel(), capturableCode(), isModifierCode() (+7 more)

### Community 93 - "session-resource-providers.test.ts"
Cohesion: 0.20
Nodes (13): claudeFixture(), ClaudeMcpRead, copilotFixture(), deferred(), directory(), DiscoveredMcp, DiscoveredSkills, fixtures (+5 more)

### Community 94 - "workspace-fixtures.ts"
Cohesion: 0.15
Nodes (13): documents, FIXTURE_NOW, fixtureBackgroundTasks, fixtureEndpoints, fixtureKnowledgeListings, fixtureKnowledgePositions, fixtureModels, PERMISSION_SESSION_ID (+5 more)

### Community 95 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 96 - "TranscriptionError"
Cohesion: 0.26
Nodes (4): LocalTranscriptionService, sha256(), fixture(), TranscriptionError

### Community 97 - "BackgroundTasksDialog.tsx"
Cohesion: 0.23
Nodes (10): DialogFrame(), BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive() (+2 more)

### Community 98 - "capture-workbench-review.ts"
Cohesion: 0.17
Nodes (10): frame(), geometry, output, scratch, screenshot(), { values }, fixtureSessions, IDLE_SESSION_ID (+2 more)

### Community 99 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 100 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 102 - "promotion-monitor.test.ts"
Cohesion: 0.27
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 103 - "shell-notifications.ts"
Cohesion: 0.26
Nodes (10): key(), label(), NotifiableSession, notificationState(), requestId(), SessionNotificationState, ShellNotificationContext, shellNotifications() (+2 more)

### Community 104 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+4 more)

### Community 105 - "background-task-tracker.ts"
Cohesion: 0.30
Nodes (6): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 106 - "recovery-seed-guards.test.ts"
Cohesion: 0.18
Nodes (8): bootLegacy(), directories, execute, pending, releases, SeedState, services, stores

### Community 107 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 108 - "server/side-question.ts"
Cohesion: 0.27
Nodes (8): SIDE_QUESTION_CLEANUP_MS, SIDE_QUESTION_RUNTIME_IDLE_MS, SIDE_QUESTION_TIMEOUT_MS, sideQuestionBoundary(), sideQuestionPrompt(), SIDE_QUESTION_EARLIER_ANSWER_MAX_LENGTH, SIDE_QUESTION_EARLIER_LIMIT, SIDE_QUESTION_MAX_LENGTH

### Community 109 - "KnowledgeRootChoices.test.tsx"
Cohesion: 0.16
Nodes (9): actions, computers, root, session, computers, first, grouped, hidden (+1 more)

### Community 110 - "SessionResources.tsx"
Cohesion: 0.18
Nodes (7): Catalog, CatalogResult, sourceLabels, statusLabels, mcp, session, skills

### Community 111 - "setupWorkspaceFixture"
Cohesion: 0.24
Nodes (6): pageFor(), createWorkspaceFixtureState(), fixtureBaseUrl(), fixtureValue(), setupWorkspaceFixture(), fixtureApi()

### Community 112 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 114 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 115 - "deleteSession"
Cohesion: 0.24
Nodes (10): addComputer(), cancelManager(), deleteKnowledgeRoot(), deleteSession(), removeComputer(), requestVoid(), removeRoot(), ComputersDialog() (+2 more)

### Community 116 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 117 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 118 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, packageManager, private, type, version

### Community 119 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 120 - "KnowledgePosition"
Cohesion: 0.39
Nodes (4): KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 121 - "render-workspace-gifs.ts"
Cohesion: 0.29
Nodes (6): directory, { values }, workflows, pnpm, onlyBuiltDependencies, ffmpeg-static

### Community 122 - "recovery-context.ts"
Cohesion: 0.38
Nodes (4): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief

### Community 123 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 124 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 125 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 130 - "MermaidDiagram.tsx"
Cohesion: 0.67
Nodes (3): drawDiagram(), drawing, MermaidDiagram()

## Knowledge Gaps
- **728 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+723 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1120 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **20 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `SessionDetail`, `SessionStore`, `.discoverSessions`, `queued-dispatch.test.ts`, `contracts.ts`, `session-resources.ts`, `background-task-adapter.ts`, `.createSession`, `directory-browser.ts`, `.handleSessionEvent`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `fixture()` connect `SessionStore` to `AgentService`, `event-log.ts`, `TmuxTerminalSessionController`, `active-sessions.ts`, `terminal-startup-queue.test.ts`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `TmuxTerminalSessionController` connect `TmuxTerminalSessionController` to `AgentService`, `.sendInternal`, `terminal-session.test.ts`, `active-sessions.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _728 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.04552845528455285 - nodes in this community are weakly interconnected._
- **Should `SessionStore` be split into smaller, more focused modules?**
  _Cohesion score 0.03459219295461758 - nodes in this community are weakly interconnected._
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
