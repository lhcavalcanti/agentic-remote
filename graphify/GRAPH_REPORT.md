# Agentic Remote - Graphify code map

Snapshot: `44d0600f6ec72e98c652d5e902ceb62dad606427c2e0c317bbf1ee24930654eb`

Source checkout: `c2cd48deb2fa364796c13af8b04254edd2a05ce6`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 262 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 262 files · ~526,386 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 4012 nodes · 11358 edges · 148 communities (110 shown, 23 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 785 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App
- AgentService
- App.tsx
- api.ts
- ClaudeAgentService
- SessionDetail
- contracts.ts
- session-store.ts
- claude-agent-service.ts
- queueConflict
- agentic-remote-promotion-monitor
- terminal-session.ts
- transcription-service.ts
- sessionKey
- app.ts
- hub-routes.ts
- active-sessions.ts
- RemoteNodeClient
- agent-service.ts
- session-knowledge-store.ts
- SessionService
- ManagedSession
- ManagerAgent
- TmuxTerminalSessionController
- markdown-navigation.ts
- .get
- manager-store.ts
- terminal-startup-queue.test.ts
- bundle
- manager-tools.ts
- session-resource-clear.test.ts
- lib.rs
- ProviderSessionService
- PushNotificationService
- manager.ts
- config.rs
- knowledge-tree.ts
- pwa.ts
- session-knowledge-routes.test.ts
- manager-agent.ts
- .sendInternal
- devDependencies
- agentic-remote
- dependencies
- FakeSessionService
- agentic-remote-promotion-setup
- TerminalSessionController
- SessionOrderStore
- background-task-adapter.ts
- agent-service.test.ts
- KnowledgeStore
- cli-canary.ts
- terminal-session.test.ts
- scripts
- shell.ts
- ComputerSummary
- ManagerStore
- .handleSessionEvent
- session-knowledge-routes.ts
- compilerOptions
- session-clear-transcript.test.ts
- session-reply-durability.test.ts
- session-store-providers.test.ts
- capture-workspace.ts
- .withFormViewport
- PromptCards.tsx
- compilerOptions
- compilerOptions
- terminal-form-deadline.test.ts
- react
- compilerOptions
- directory-browser.ts
- event-log.ts
- ManagerMemory
- workspace-browser.ts
- workspace-fixtures.ts
- recordValue
- ManagerClientDefaults
- use-session-knowledge-root.ts
- ReaderWorkspace
- backgroundTasksFromEvents
- background-task-stop.test.ts
- recovery-resend-durability.test.ts
- session-resource-routes.test.ts
- NewSessionDialog
- check-workspace-review-regressions.ts
- desktop.json
- .toolHost
- BackgroundTasksDialog.tsx
- capture-workbench-review.ts
- .oxlintrc.json
- settings-local.json
- session-response-order.ts
- shell-notifications.ts
- scripts
- .askSession
- background-task-tracker.ts
- promotion-monitor.test.ts
- recovery-seed-guards.test.ts
- html-preview.ts
- submission-error.ts
- server/side-question.ts
- setupWorkspaceFixture
- generate-pwa-icons.ts
- DeferredSession
- bridge.rs
- askSession
- screenshot-stability.test.ts
- package.json
- release-publication.test.ts
- KnowledgePosition
- render-workspace-gifs.ts
- recovery-context.ts
- settings.ts
- composer-layout.test.ts
- hasRunningBackgroundAgent
- promotion-setup-execution.test.ts
- MockMediaRecorder
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

## Communities (148 total, 23 thin omitted)

### Community 0 - "App"
Cohesion: 0.03
Nodes (139): isManagerEvent(), clearConversation(), recoverConversation(), removeQueuedPrompt(), reorderQueuedPrompts(), saveSessionOrderLane(), saveSessionVisibility(), transcribeAudio() (+131 more)

### Community 1 - "AgentService"
Cohesion: 0.05
Nodes (7): agentMode(), AgentService, isMissingSessionError(), removeCopilotSessionFiles(), RuntimeConfigurationError, fixture(), httpBoundary()

### Community 2 - "App.tsx"
Cohesion: 0.03
Nodes (101): addComputer(), removeComputer(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage() (+93 more)

### Community 3 - "api.ts"
Cohesion: 0.04
Nodes (103): parseSubmissionReceipt(), submissionReceiptFromError(), addKnowledgeRoot(), bootstrapSessionOrder(), cancelBackgroundTask(), cancelManager(), cancelSession(), configureRuntime() (+95 more)

### Community 4 - "ClaudeAgentService"
Cohesion: 0.04
Nodes (24): ClaudeAgentService, isMissingClaudeSessionError(), cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle() (+16 more)

### Community 5 - "SessionDetail"
Cohesion: 0.06
Nodes (14): fixture(), channels, directories, fixture(), observe(), clearRecoverySeedFailure(), cloneSession(), ownsRecoverySeedFailure() (+6 more)

### Community 6 - "contracts.ts"
Cohesion: 0.04
Nodes (58): TerminalFormContinuation, ComputerManagerEvents, RemoteResync, RemoteSessionRead, DirectoryScope, directories, routingFixture(), session() (+50 more)

### Community 7 - "session-store.ts"
Cohesion: 0.03
Nodes (72): CopilotClientLike, fixture(), holdProbe(), fixtures, gate(), releases, directories, fakeClient() (+64 more)

### Community 8 - "claude-agent-service.ts"
Cohesion: 0.07
Nodes (59): AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission (+51 more)

### Community 9 - "queueConflict"
Cohesion: 0.06
Nodes (33): acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight(), preparePrompt(), queueConflict() (+25 more)

### Community 10 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (67): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+59 more)

### Community 11 - "terminal-session.ts"
Cohesion: 0.05
Nodes (61): composer(), processAdapter, boxedComposerFrame(), captureTerminal(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFocusWitnessed(), composerFrameText() (+53 more)

### Community 12 - "transcription-service.ts"
Cohesion: 0.05
Nodes (36): BuildAppOptions, collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation (+28 more)

### Community 13 - "sessionKey"
Cohesion: 0.07
Nodes (51): RenameSessionDialog(), SessionResourcesDialog(), KnowledgeRootSelector(), root, SessionFilter, sessionNavigationView, stepVisibleSession(), attentionRank (+43 more)

### Community 14 - "app.ts"
Cohesion: 0.05
Nodes (49): prefixes, session, trusted, untrusted, directories, buildApp(), errorStatusCode(), isAppleTouchIconProbe() (+41 more)

### Community 15 - "hub-routes.ts"
Cohesion: 0.05
Nodes (54): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+46 more)

### Community 16 - "active-sessions.ts"
Cohesion: 0.06
Nodes (49): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates(), isCopilotProcess() (+41 more)

### Community 17 - "RemoteNodeClient"
Cohesion: 0.05
Nodes (12): RemoteNodeClient, client(), servers, session, BackgroundTaskSnapshot, NodeInfo, RemovedQueuedPrompt, WorkspaceFile (+4 more)

### Community 18 - "agent-service.ts"
Cohesion: 0.04
Nodes (49): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), ActivityToolStart, AgentServiceEvents, ansiSequence, commandShortcut() (+41 more)

### Community 19 - "session-knowledge-store.ts"
Cohesion: 0.07
Nodes (29): bindingKey(), bindingSchema, Identity, PathRecord, pathRecordKey(), PathState, pathStateFor(), pathStateSchema (+21 more)

### Community 20 - "SessionService"
Cohesion: 0.07
Nodes (11): ActiveClaudeQuery, registerNodeRoutes(), releases, session, snapshot, readServiceResources(), readSessionMcpServers(), readSessionSkills() (+3 more)

### Community 21 - "ManagedSession"
Cohesion: 0.15
Nodes (7): ComputerManager, managedSession(), RemoteSessionListing, registerHubRoutes(), ManagedRemovedQueuedPrompt, ManagedSession, SessionListing

### Community 22 - "ManagerAgent"
Cohesion: 0.12
Nodes (8): delay(), errorMessage(), isNotFound(), ManagerAgent, TurnError, withTimeout(), ManagerMessage, ManagerStatus

### Community 23 - "TmuxTerminalSessionController"
Cohesion: 0.11
Nodes (13): copilotCommand(), endProbeSession(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand(), safeWindowName(), clearFixture() (+5 more)

### Community 24 - "markdown-navigation.ts"
Cohesion: 0.09
Nodes (39): executeCommand(), listWorkspace(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink(), KnowledgeReader(), markdownComponentsFor() (+31 more)

### Community 26 - "manager-store.ts"
Cohesion: 0.09
Nodes (29): ago(), attentionRank(), buildTurnContext(), changeLines(), clock(), MANAGER_SYSTEM_PROMPT, managerPrompt(), oneLine() (+21 more)

### Community 27 - "terminal-startup-queue.test.ts"
Cohesion: 0.11
Nodes (38): findActiveCopilotSessions(), exec, formFixture(), horizontalFormFixture(), textFieldFormFixture(), directories, exec, acceptedStartupRecovery() (+30 more)

### Community 28 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 29 - "manager-tools.ts"
Cohesion: 0.09
Nodes (21): computerField, createManagerTools(), define(), requireComputer(), resolveSession(), errorMessage(), failure(), link() (+13 more)

### Community 30 - "session-resource-clear.test.ts"
Cohesion: 0.06
Nodes (26): phases, port, apps, directories, directory(), obstructUploads(), pairedFixture(), providerFixture() (+18 more)

### Community 31 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 33 - "PushNotificationService"
Cohesion: 0.11
Nodes (13): brief(), HubEventSource, PushNotificationService, PushSender, PushState, directories, RFC-8030, RFC-8030 (+5 more)

### Community 34 - "manager.ts"
Cohesion: 0.09
Nodes (27): ManagerEventSource, MANAGER_MESSAGE_MAX_LENGTH, MANAGER_SNAPSHOT_MESSAGES, ManagerConfirmation, ManagerEvent, ManagerMessageRole, ManagerMessageState, ManagerSessionRef (+19 more)

### Community 35 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 36 - "knowledge-tree.ts"
Cohesion: 0.09
Nodes (35): WorkspaceEntry, listKnowledgeEntries(), readKnowledgeFile(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor() (+27 more)

### Community 37 - "pwa.ts"
Cohesion: 0.11
Nodes (34): deletePushSubscription(), getProviderRuntimeOptions(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate() (+26 more)

### Community 38 - "session-knowledge-routes.test.ts"
Cohesion: 0.08
Nodes (17): ServerRole, managers, releases, remote, SessionMetadataLookup, ComputerRegistry, RegistryState, directories (+9 more)

### Community 39 - "manager-agent.ts"
Cohesion: 0.08
Nodes (16): discover(), ManagerAgentOptions, ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig, Rung, Behavior (+8 more)

### Community 40 - ".sendInternal"
Cohesion: 0.14
Nodes (27): activeBottomFrame(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), composerHoldsText(), composerText(), containsCopiedInteractiveFrame(), desktopInstallPromptIdentity() (+19 more)

### Community 41 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 42 - "agentic-remote"
Cohesion: 0.13
Nodes (31): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+23 more)

### Community 43 - "dependencies"
Cohesion: 0.06
Nodes (33): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, @fastify/multipart, @fastify/static, @fastify/websocket, lucide-react (+25 more)

### Community 45 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (30): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+22 more)

### Community 46 - "TerminalSessionController"
Cohesion: 0.11
Nodes (3): persistedFormAnswer(), TerminalSessionController, PendingUserInput

### Community 47 - "SessionOrderStore"
Cohesion: 0.15
Nodes (13): start(), directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey() (+5 more)

### Community 48 - "background-task-adapter.ts"
Cohesion: 0.13
Nodes (26): addActivity(), BackgroundTaskEventOptions, boundedText(), CopilotClientTaskInfo, CopilotClientTaskProgress, CopilotTaskInfo, CopilotTaskProgress, eventTask() (+18 more)

### Community 49 - "agent-service.test.ts"
Cohesion: 0.10
Nodes (16): CopilotSessionLike, foregroundTurnOpen(), isForegroundCompletionEvent(), isForegroundLifecycleEvent(), statusFromEvents(), terminalFormSteps(), configurableModel(), directories (+8 more)

### Community 50 - "KnowledgeStore"
Cohesion: 0.16
Nodes (8): WorkspaceFixtureState, KnowledgeRootReservation, KnowledgeState, KnowledgeStore, directories, fixture(), createHub(), KnowledgeRoot

### Community 51 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 52 - "terminal-session.test.ts"
Cohesion: 0.09
Nodes (21): parseTerminalUpdateNotice(), terminalChecklistState(), terminalFormCommitKeys(), bracketedTabPane, deliveryFixture(), desktopInstallPane, directories, downloadedUpdateFooter (+13 more)

### Community 53 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 54 - "shell.ts"
Cohesion: 0.15
Nodes (24): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), onShellDeepLink(), onShellNotificationReply(), openShellSettings() (+16 more)

### Community 55 - "ComputerSummary"
Cohesion: 0.12
Nodes (11): fixture(), session(), sessionAtLeastAsNew(), RegisteredComputer, FakeManager, ComputerSummary, computers, first (+3 more)

### Community 56 - "ManagerStore"
Cohesion: 0.14
Nodes (3): openStore(), ManagerStore, open()

### Community 57 - ".handleSessionEvent"
Cohesion: 0.22
Nodes (20): activityKind(), activityResult(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), isBackgroundTaskEvent(), isUnsupportedBackgroundTaskError() (+12 more)

### Community 58 - "session-knowledge-routes.ts"
Cohesion: 0.13
Nodes (17): Lineage, registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession() (+9 more)

### Community 59 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 60 - "session-clear-transcript.test.ts"
Cohesion: 0.11
Nodes (10): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions, disk, fixture(), fixtures, gate() (+2 more)

### Community 61 - "session-reply-durability.test.ts"
Cohesion: 0.16
Nodes (18): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRequest() (+10 more)

### Community 62 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (11): claude(), clearFixture(), copilot(), disk, event(), fixture(), fixtures, holdOtherWrite() (+3 more)

### Community 63 - "capture-workspace.ts"
Cohesion: 0.20
Nodes (20): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+12 more)

### Community 64 - ".withFormViewport"
Cohesion: 0.19
Nodes (16): FormReplyDeadlineError, hasClippedTerminalFormFooter(), hasClippedTerminalFormTabs(), hasComposerAfter(), hasTerminalFormQuestionReflowCandidate(), parseTerminalFormActiveField(), parseTerminalFormPrompt(), submitTerminalForm() (+8 more)

### Community 65 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (19): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+11 more)

### Community 66 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 67 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 68 - "terminal-form-deadline.test.ts"
Cohesion: 0.12
Nodes (14): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+6 more)

### Community 69 - "react"
Cohesion: 0.12
Nodes (9): react, DocumentViewControls(), actions, outline, DocumentHeading, MarkdownCodeBlock(), copy(), originalClipboard (+1 more)

### Community 70 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 71 - "directory-browser.ts"
Cohesion: 0.23
Nodes (11): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin(), SessionDirectoryError (+3 more)

### Community 72 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 73 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 74 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 75 - "workspace-fixtures.ts"
Cohesion: 0.14
Nodes (16): documents, FIXTURE_NOW, fixtureBackgroundTasks, fixtureEndpoints, fixtureKnowledgeListings, fixtureKnowledgePositions, fixtureKnowledgeRoots, fixtureModels (+8 more)

### Community 76 - "recordValue"
Cohesion: 0.18
Nodes (18): attachmentModeValue(), backgroundHandoff(), booleanValue(), errorValue(), notificationKind(), parsedValue(), rawTailText(), recordValue() (+10 more)

### Community 77 - "ManagerClientDefaults"
Cohesion: 0.18
Nodes (10): confirmationSchema, defaultsSchema, effort, ManagerRouteAgent, messageParams, registerManagerRoutes(), sendSchema, unavailableSnapshot() (+2 more)

### Community 78 - "use-session-knowledge-root.ts"
Cohesion: 0.21
Nodes (12): getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey(), knowledgePositionForBinding(), SessionIdentity (+4 more)

### Community 79 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 80 - "backgroundTasksFromEvents"
Cohesion: 0.19
Nodes (16): backgroundTasksFromEvents(), eventString(), isLiveTaskStatus(), isOlderExecution(), isShellObserverTool(), isShellStopTool(), isShellTool(), isTerminalTaskStatus() (+8 more)

### Community 81 - "background-task-stop.test.ts"
Cohesion: 0.21
Nodes (13): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), snapshot() (+5 more)

### Community 82 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 83 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 84 - "NewSessionDialog"
Cohesion: 0.20
Nodes (16): activateSession(), createSession(), listDirectories(), listHistory(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), moveSessionToBrowsedFolder() (+8 more)

### Community 85 - "check-workspace-review-regressions.ts"
Cohesion: 0.14
Nodes (12): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+4 more)

### Community 86 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 88 - "BackgroundTasksDialog.tsx"
Cohesion: 0.23
Nodes (10): DialogFrame(), BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive() (+2 more)

### Community 89 - "capture-workbench-review.ts"
Cohesion: 0.17
Nodes (10): frame(), geometry, output, scratch, screenshot(), { values }, fixtureSessions, IDLE_SESSION_ID (+2 more)

### Community 90 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 91 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 92 - "session-response-order.ts"
Cohesion: 0.27
Nodes (11): sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), currentSessionEventSequence(), nextSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences (+3 more)

### Community 93 - "shell-notifications.ts"
Cohesion: 0.26
Nodes (10): key(), label(), NotifiableSession, notificationState(), requestId(), SessionNotificationState, ShellNotificationContext, shellNotifications() (+2 more)

### Community 94 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+4 more)

### Community 96 - "background-task-tracker.ts"
Cohesion: 0.30
Nodes (6): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 97 - "promotion-monitor.test.ts"
Cohesion: 0.30
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 98 - "recovery-seed-guards.test.ts"
Cohesion: 0.18
Nodes (8): bootLegacy(), directories, execute, pending, releases, SeedState, services, stores

### Community 99 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 100 - "submission-error.ts"
Cohesion: 0.31
Nodes (6): RemoteNodeRedirectError, RemoteNodeRequestError, httpDeliveryUncertain(), legacyDefinitiveHttpRefusals, SubmissionError, SubmissionReceipt

### Community 101 - "server/side-question.ts"
Cohesion: 0.27
Nodes (8): SIDE_QUESTION_CLEANUP_MS, SIDE_QUESTION_RUNTIME_IDLE_MS, SIDE_QUESTION_TIMEOUT_MS, sideQuestionBoundary(), sideQuestionPrompt(), SIDE_QUESTION_EARLIER_ANSWER_MAX_LENGTH, SIDE_QUESTION_EARLIER_LIMIT, SIDE_QUESTION_MAX_LENGTH

### Community 102 - "setupWorkspaceFixture"
Cohesion: 0.24
Nodes (6): pageFor(), createWorkspaceFixtureState(), fixtureBaseUrl(), fixtureValue(), setupWorkspaceFixture(), fixtureApi()

### Community 103 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 105 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 106 - "askSession"
Cohesion: 0.29
Nodes (8): askSession(), askSideQuestion(), closeSideQuestion(), openSideQuestion(), sideQuestionKeyDown(), submitSideQuestion(), updateSideThread(), sideQuestionCommand()

### Community 107 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 108 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, packageManager, private, type, version

### Community 109 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 110 - "KnowledgePosition"
Cohesion: 0.39
Nodes (4): KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 111 - "render-workspace-gifs.ts"
Cohesion: 0.29
Nodes (6): directory, { values }, workflows, pnpm, onlyBuiltDependencies, ffmpeg-static

### Community 112 - "recovery-context.ts"
Cohesion: 0.38
Nodes (4): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief

### Community 113 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 114 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 119 - "MermaidDiagram.tsx"
Cohesion: 0.67
Nodes (3): drawDiagram(), drawing, MermaidDiagram()

## Knowledge Gaps
- **728 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+723 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1113 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **23 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `SessionDetail`, `contracts.ts`, `directory-browser.ts`, `claude-agent-service.ts`, `queueConflict`, `TerminalSessionController`, `background-task-adapter.ts`, `agent-service.test.ts`, `agent-service.ts`, `.get`, `.handleSessionEvent`, `.askSession`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `App()` connect `App` to `App.tsx`, `api.ts`, `knowledge-tree.ts`, `pwa.ts`, `askSession`, `sessionKey`, `KnowledgePosition`, `hub-routes.ts`, `use-session-knowledge-root.ts`, `hasRunningBackgroundAgent`, `NewSessionDialog`, `shell.ts`, `markdown-navigation.ts`, `.get`, `session-response-order.ts`, `shell-notifications.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Why does `RemoteNodeClient` connect `RemoteNodeClient` to `contracts.ts`, `claude-agent-service.ts`, `transcription-service.ts`, `FakeSessionService`, `manager-tools.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _728 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.03242941012021247 - nodes in this community are weakly interconnected._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.049019607843137254 - nodes in this community are weakly interconnected._
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
