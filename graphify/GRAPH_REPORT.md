# Agentic Remote - Graphify code map

Snapshot: `db845f7349b26e7a82ff71eb7548e4fc471e56c38133701aa8b7a1fcbe0a1232`

Source checkout: `a9815563d287c0178850ba17f9f3880b920b2725`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 278 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 278 files · ~562,339 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 4231 nodes · 12017 edges · 154 communities (116 shown, 23 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 825 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- App
- api.ts
- App.tsx
- SessionStore
- SessionDetail
- RemoteNodeClient
- computer-manager.ts
- agentic-remote-promotion-monitor
- sessionKey
- contracts.ts
- CopilotSessionLike
- session-store-providers.test.ts
- terminal-session.ts
- manager-agent.ts
- hub-routes.ts
- pwa.ts
- ManagerAgent
- session-knowledge-store.ts
- TmuxTerminalSessionController
- SessionService
- ManagedSession
- markdown-navigation.ts
- agent-service.ts
- manager-tools.ts
- TerminalSessionController
- CopilotClientLike
- terminal-startup-queue.test.ts
- manager-store.ts
- node-routes.ts
- terminal-session.test.ts
- session-knowledge-routes.test.ts
- bundle
- FakeSessionService
- ProviderSessionService
- lib.rs
- recovery-resend-durability.test.ts
- shell.ts
- agentic-remote-promotion-setup
- config.rs
- active-sessions.ts
- app.ts
- knowledge-tree.ts
- .sendInternal
- devDependencies
- manager-agent.test.ts
- agentic-remote
- dependencies
- claude-agent-service.ts
- session-reply-durability.test.ts
- PushNotificationService
- SessionOrderStore
- background-task-adapter.ts
- cli-canary.ts
- ManagerStore
- ManagerAssistant.tsx
- scripts
- .createSession
- delegated-transcription-service.ts
- noTmuxServer
- ManagerMemory
- session-knowledge-routes.ts
- compilerOptions
- transcription-service.ts
- session-resource-clear.test.ts
- queue-batch-benchmark.ts
- capture-workspace.ts
- recordValue
- use-oracle-settings.ts
- startup-phases.test.ts
- PromptCards.tsx
- ManagerAssistant
- compilerOptions
- ComputerSummary
- compilerOptions
- check-workspace-review-regressions.ts
- compilerOptions
- recordValue
- event-log.ts
- workspace-browser.ts
- SessionKnowledgeBinding
- react
- NodeIdentityStore
- .toolHost
- backgroundTasksFromEvents
- ReaderWorkspace
- session-resource-routes.test.ts
- terminal-form-deadline.test.ts
- background-task-stop.test.ts
- BackgroundTasksDialog.tsx
- workspace-fixtures.ts
- desktop.json
- session-resource-providers.test.ts
- capture-workbench-review.ts
- .oxlintrc.json
- settings-local.json
- promotion-monitor.test.ts
- TranscriptionError
- scripts
- background-task-tracker.ts
- push-notification-service.ts
- SessionAdmissions
- html-preview.ts
- server/side-question.ts
- setupWorkspaceFixture
- generate-pwa-icons.ts
- DeferredSession
- bridge.rs
- screenshot-stability.test.ts
- promotion-setup-execution.test.ts
- KnowledgePosition
- package.json
- SessionFileUpload
- agent-service.test.ts
- release-publication.test.ts
- render-workspace-gifs.ts
- recovery-context.ts
- settings.ts
- composer-layout.test.ts
- MarkdownCodeBlock.tsx
- hasRunningBackgroundAgent
- FakeRecorder
- .discoverTerminalSessions
- terminal-send-uncertainty.test.ts
- MockMediaRecorder
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
1. `SessionDetail` - 280 edges
2. `App()` - 259 edges
3. `AgentService` - 247 edges
4. `SessionStore` - 171 edges
5. `ClaudeAgentService` - 125 edges
6. `ManagedSession` - 91 edges
7. `ComputerManager` - 83 edges
8. `registerHubRoutes()` - 80 edges
9. `SessionService` - 72 edges
10. `TmuxTerminalSessionController` - 69 edges

## Surprising Connections (you probably didn't know these)
- `submit()` --indirect_call--> `provider()`  [INFERRED]
  src/App.tsx → server/provider-session-service.test.ts
- `composerKeyDown()` --indirect_call--> `composer()`  [INFERRED]
  src/App.tsx → server/terminal-send-uncertainty.test.ts
- `AcceptedSdkReply` --references--> `SessionDetail`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `AgentServiceEvents` --references--> `ServerEvent`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `BackgroundTaskUpdate` --references--> `BackgroundTaskSnapshot`  [EXTRACTED]
  server/background-task-tracker.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (154 total, 23 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.04
Nodes (6): agentMode(), AgentService, foregroundTurnOpen(), isMissingSessionError(), isUncertainDelivery(), deliveryUncertaintyFromError()

### Community 1 - "App"
Cohesion: 0.03
Nodes (144): isManagerEvent(), askSession(), clearConversation(), recoverConversation(), removeQueuedPrompt(), reorderQueuedPrompts(), saveSessionVisibility(), transcribeAudio() (+136 more)

### Community 2 - "api.ts"
Cohesion: 0.03
Nodes (114): parseSubmissionReceipt(), submissionReceiptFromError(), addKnowledgeRoot(), bootstrapSessionOrder(), cancelBackgroundTask(), cancelManager(), cancelSession(), configureRuntime() (+106 more)

### Community 3 - "App.tsx"
Cohesion: 0.03
Nodes (108): addComputer(), removeComputer(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage() (+100 more)

### Community 4 - "SessionStore"
Cohesion: 0.04
Nodes (58): fixture(), holdProbe(), fixtures, gate(), releases, restart(), fixture(), connect() (+50 more)

### Community 5 - "SessionDetail"
Cohesion: 0.05
Nodes (9): ClaudeAgentService, isClaudeAuthenticationError(), isMissingClaudeSessionError(), toolResultText(), observe(), clearRecoverySeedFailure(), QueuedPromptReservation, QueuedPrompt (+1 more)

### Community 6 - "RemoteNodeClient"
Cohesion: 0.04
Nodes (33): RemoteResync, RemoteSessionRead, DEFINITE_DISPATCH_REFUSALS, headerSafe(), normalizeNodeUrl(), REDIRECT_STATUSES, RemoteNodeClient, client() (+25 more)

### Community 7 - "computer-manager.ts"
Cohesion: 0.08
Nodes (52): ClaudeResources, claudeMcp(), claudeSkillNames(), copilotMcp, copilotSkills, copilotWorkspaceMcp, CopilotWorkspaceSkills, count() (+44 more)

### Community 8 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (71): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+63 more)

### Community 9 - "sessionKey"
Cohesion: 0.06
Nodes (59): saveSessionOrderLane(), handleDragEnd(), RenameSessionDialog(), SessionResourcesDialog(), KnowledgeRootSelector(), root, reorderSessionLaneWithHiddenFollowers(), SessionFilter (+51 more)

### Community 10 - "contracts.ts"
Cohesion: 0.05
Nodes (39): TerminalFormContinuation, ClaudeAgentServiceEvents, managers, releases, remote, RegistryState, DirectoryScope, directories (+31 more)

### Community 11 - "CopilotSessionLike"
Cohesion: 0.05
Nodes (31): CopilotSessionLike, CopilotTasksApi, acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight() (+23 more)

### Community 12 - "session-store-providers.test.ts"
Cohesion: 0.03
Nodes (44): ClaudeSdk, cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle(), build() (+36 more)

### Community 13 - "terminal-session.ts"
Cohesion: 0.06
Nodes (59): boxedComposerFrame(), captureTerminal(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFrameText(), composerHasFocus(), composerHoldsOtherText(), composerRowText() (+51 more)

### Community 14 - "manager-agent.ts"
Cohesion: 0.06
Nodes (35): CreationRuntime, ManagerEventSource, discover(), isPending(), isQueued(), Rung, TURN_ACTIVITY, confirmationSchema (+27 more)

### Community 15 - "hub-routes.ts"
Cohesion: 0.06
Nodes (52): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+44 more)

### Community 16 - "pwa.ts"
Cohesion: 0.07
Nodes (52): activateSession(), createSession(), deletePushSubscription(), getProviderRuntimeOptions(), getPushPublicKey(), listDirectories(), listHistory(), savePushSubscription() (+44 more)

### Community 17 - "ManagerAgent"
Cohesion: 0.11
Nodes (10): checkContent(), delay(), errorMessage(), isNotFound(), ManagerAgent, sameRuntime(), TurnError, withTimeout() (+2 more)

### Community 18 - "session-knowledge-store.ts"
Cohesion: 0.07
Nodes (29): bindingKey(), bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor() (+21 more)

### Community 19 - "TmuxTerminalSessionController"
Cohesion: 0.09
Nodes (17): copilotCommand(), endProbeSession(), execFileAsync, formReplyExpired(), parseTerminalUpdateNotice(), processAncestors(), processCommand(), processIsAlive() (+9 more)

### Community 20 - "SessionService"
Cohesion: 0.07
Nodes (9): ActiveClaudeQuery, registerNodeRoutes(), releases, session, snapshot, readServiceResources(), ResourceReads, resourceRequestHandler() (+1 more)

### Community 21 - "ManagedSession"
Cohesion: 0.16
Nodes (7): ComputerManager, managedSession(), RemoteSessionListing, registerHubRoutes(), ManagedRemovedQueuedPrompt, ManagedSession, SessionListing

### Community 22 - "markdown-navigation.ts"
Cohesion: 0.08
Nodes (41): executeCommand(), listWorkspace(), readWorkspaceFile(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink(), KnowledgeReader() (+33 more)

### Community 23 - "agent-service.ts"
Cohesion: 0.05
Nodes (47): AcceptedSdkReply, ActivePrompt, activityDuration(), ActivityToolStart, AgentServiceEvents, ansiSequence, commandShortcut(), DeliveryBoundary (+39 more)

### Community 24 - "manager-tools.ts"
Cohesion: 0.08
Nodes (26): APPROVE_WORDS, computerField, createManagerTools(), define(), deliver(), requireComputer(), resolveSession(), trustFolder() (+18 more)

### Community 25 - "TerminalSessionController"
Cohesion: 0.07
Nodes (7): isForegroundCompletionEvent(), isForegroundLifecycleEvent(), persistedFormAnswer(), removeCopilotSessionFiles(), statusFromEvents(), TerminalFormReplyError, TerminalSessionController

### Community 26 - "CopilotClientLike"
Cohesion: 0.05
Nodes (25): CopilotClientLike, directories, fakeClient(), ForkRequest, forkSession(), services, FakeCopilotClient, probeService() (+17 more)

### Community 27 - "terminal-startup-queue.test.ts"
Cohesion: 0.11
Nodes (38): findActiveCopilotSessions(), exec, formFixture(), horizontalFormFixture(), textFieldFormFixture(), directories, exec, acceptedStartupRecovery() (+30 more)

### Community 28 - "manager-store.ts"
Cohesion: 0.10
Nodes (28): ago(), attentionRank(), buildTurnContext(), changeLines(), clock(), MANAGER_SYSTEM_PROMPT, managerPrompt(), oneLine() (+20 more)

### Community 29 - "node-routes.ts"
Cohesion: 0.06
Nodes (38): AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema (+30 more)

### Community 30 - "terminal-session.test.ts"
Cohesion: 0.07
Nodes (34): FormReplyDeadlineError, hasClippedTerminalFormFooter(), hasClippedTerminalFormTabs(), hasTerminalFormQuestionReflowCandidate(), isTerminalLoading(), parseTerminalFormActiveField(), submitTerminalForm(), tabNames() (+26 more)

### Community 31 - "session-knowledge-routes.test.ts"
Cohesion: 0.08
Nodes (18): WorkspaceFixtureState, ServerRole, SessionMetadataLookup, SessionMuteCarrier, KnowledgeRootReservation, KnowledgeState, KnowledgeStore, directories (+10 more)

### Community 32 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 33 - "FakeSessionService"
Cohesion: 0.06
Nodes (4): FakeSessionService, routingFixture(), session(), temporaryDirectory()

### Community 35 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 36 - "recovery-resend-durability.test.ts"
Cohesion: 0.06
Nodes (19): directories, services, setup(), TurnSession, directories, disk, fixture(), gate() (+11 more)

### Community 37 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 38 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 39 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 40 - "active-sessions.ts"
Cohesion: 0.11
Nodes (34): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates(), isCopilotProcess() (+26 more)

### Community 41 - "app.ts"
Cohesion: 0.10
Nodes (25): prefixes, session, trusted, untrusted, directories, buildApp(), errorStatusCode(), isAppleTouchIconProbe() (+17 more)

### Community 42 - "knowledge-tree.ts"
Cohesion: 0.09
Nodes (34): WorkspaceEntry, listKnowledgeEntries(), readKnowledgeFile(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor() (+26 more)

### Community 43 - ".sendInternal"
Cohesion: 0.16
Nodes (29): activeBottomFrame(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), composerFocusWitnessed(), composerHoldsText(), composerText(), containsCopiedInteractiveFrame() (+21 more)

### Community 44 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 45 - "manager-agent.test.ts"
Cohesion: 0.08
Nodes (16): ManagerAgentOptions, ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig, Behavior, computers, fail() (+8 more)

### Community 46 - "agentic-remote"
Cohesion: 0.13
Nodes (31): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+23 more)

### Community 47 - "dependencies"
Cohesion: 0.06
Nodes (33): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, @fastify/multipart, @fastify/static, @fastify/websocket, lucide-react (+25 more)

### Community 48 - "claude-agent-service.ts"
Cohesion: 0.13
Nodes (22): AuthStatusRunner, ClaudeQuestion, execFileAsync, PendingClaudeInput, PendingClaudePermission, PendingClaudeReply, displayPath(), listHomeDirectories() (+14 more)

### Community 49 - "session-reply-durability.test.ts"
Cohesion: 0.13
Nodes (18): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRequest() (+10 more)

### Community 50 - "PushNotificationService"
Cohesion: 0.18
Nodes (4): brief(), HubEventSource, PushNotificationService, registerPushRoutes()

### Community 51 - "SessionOrderStore"
Cohesion: 0.17
Nodes (10): directories, orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState, SessionOrderStore, directories (+2 more)

### Community 52 - "background-task-adapter.ts"
Cohesion: 0.10
Nodes (24): BackgroundTaskEventOptions, CopilotClientTaskInfo, CopilotClientTaskProgress, CopilotTaskInfo, CopilotTaskProgress, isBackgroundTaskInfo(), isBackgroundTaskProgress(), isLiveTaskStatus() (+16 more)

### Community 53 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 54 - "ManagerStore"
Cohesion: 0.13
Nodes (4): openStore(), emptyState(), ManagerStore, open()

### Community 55 - "ManagerAssistant.tsx"
Cohesion: 0.12
Nodes (17): ManagerSessionRef, removeQueuedManagerMessage(), resolveManagerConfirmation(), retryManagerMessage(), sessionLinkTarget(), boundWidth(), OracleButton(), OracleControl (+9 more)

### Community 56 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 57 - ".createSession"
Cohesion: 0.11
Nodes (8): RuntimeConfigurationError, closers, directories, heldSession(), local, runtime(), SideQuestionError, withSideQuestionTimeout()

### Community 58 - "delegated-transcription-service.ts"
Cohesion: 0.11
Nodes (12): BuildAppOptions, collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation (+4 more)

### Community 59 - "noTmuxServer"
Cohesion: 0.11
Nodes (16): listTmuxSessions(), noTmuxServer(), processGone(), procVisible(), socketIdentity(), directories, { execute }, files (+8 more)

### Community 60 - "ManagerMemory"
Cohesion: 0.14
Nodes (7): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits, ManagerToolActivity, computers

### Community 61 - "session-knowledge-routes.ts"
Cohesion: 0.13
Nodes (17): Lineage, registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession() (+9 more)

### Community 62 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 63 - "transcription-service.ts"
Cohesion: 0.11
Nodes (19): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+11 more)

### Community 64 - "session-resource-clear.test.ts"
Cohesion: 0.13
Nodes (20): apps, directories, directory(), obstructUploads(), pairedFixture(), providerFixture(), providers, seed() (+12 more)

### Community 65 - "queue-batch-benchmark.ts"
Cohesion: 0.12
Nodes (12): asJson, benchClient(), BenchSession, delay(), repeats, rows, rtts, run() (+4 more)

### Community 66 - "capture-workspace.ts"
Cohesion: 0.20
Nodes (20): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+12 more)

### Community 67 - "recordValue"
Cohesion: 0.24
Nodes (18): activityGroupIdFor(), activityKind(), activityResult(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), isBackgroundTaskEvent() (+10 more)

### Community 68 - "use-oracle-settings.ts"
Cohesion: 0.16
Nodes (13): RuntimeModelOption, getManager(), updateManagerSettings(), effortFrom(), efforts, OracleModelSettings(), OracleSettingsStatus(), HarnessProps (+5 more)

### Community 69 - "startup-phases.test.ts"
Cohesion: 0.12
Nodes (12): phases, port, createStartupPhases(), startManagedServer(), StartupPhaseEvent, StartupPhaseRecord, address, directories (+4 more)

### Community 70 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (19): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+11 more)

### Community 71 - "ManagerAssistant"
Cohesion: 0.14
Nodes (19): editQueuedManagerMessage(), applyEvent(), canTakeFocus(), ManagerAssistant(), act(), announce(), cancelEdit(), onEditKeyDown() (+11 more)

### Community 72 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 73 - "ComputerSummary"
Cohesion: 0.18
Nodes (5): fixture(), session(), sessionAtLeastAsNew(), RegisteredComputer, ComputerSummary

### Community 74 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 75 - "check-workspace-review-regressions.ts"
Cohesion: 0.13
Nodes (15): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+7 more)

### Community 76 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 77 - "recordValue"
Cohesion: 0.18
Nodes (19): attachmentModeValue(), backgroundHandoff(), booleanValue(), eventString(), lastForegroundCompletionAt(), normalizedToolName(), notificationKind(), parsedValue() (+11 more)

### Community 78 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 79 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 80 - "SessionKnowledgeBinding"
Cohesion: 0.20
Nodes (13): SessionKnowledgeBinding, getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey(), knowledgePositionForBinding() (+5 more)

### Community 81 - "react"
Cohesion: 0.14
Nodes (8): react, drawDiagram(), drawing, MermaidDiagram(), SessionActions(), recordingDuration(), FakeRecorder, useVoiceRecorder()

### Community 82 - "NodeIdentityStore"
Cohesion: 0.18
Nodes (4): ComputerRegistry, directories, remoteSnapshotFixture(), NodeIdentityStore

### Community 84 - "backgroundTasksFromEvents"
Cohesion: 0.27
Nodes (17): addActivity(), backgroundTasksFromEvents(), boundedText(), errorValue(), eventTask(), executionModeValue(), isTerminalTaskStatus(), mergeShellRefresh() (+9 more)

### Community 85 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 86 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 87 - "terminal-form-deadline.test.ts"
Cohesion: 0.16
Nodes (11): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+3 more)

### Community 88 - "background-task-stop.test.ts"
Cohesion: 0.23
Nodes (12): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), started() (+4 more)

### Community 89 - "BackgroundTasksDialog.tsx"
Cohesion: 0.22
Nodes (11): BackgroundTask, DialogFrame(), BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel() (+3 more)

### Community 90 - "workspace-fixtures.ts"
Cohesion: 0.15
Nodes (13): documents, FIXTURE_NOW, fixtureBackgroundTasks, fixtureComputers, fixtureEndpoints, fixtureKnowledgeListings, fixtureKnowledgePositions, fixtureModels (+5 more)

### Community 91 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 92 - "session-resource-providers.test.ts"
Cohesion: 0.22
Nodes (13): claudeFixture(), ClaudeMcpRead, copilotFixture(), deferred(), directory(), DiscoveredMcp, DiscoveredSkills, fixtures (+5 more)

### Community 93 - "capture-workbench-review.ts"
Cohesion: 0.17
Nodes (10): frame(), geometry, output, scratch, screenshot(), { values }, fixtureSessions, IDLE_SESSION_ID (+2 more)

### Community 94 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 95 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 96 - "promotion-monitor.test.ts"
Cohesion: 0.27
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 97 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 98 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+4 more)

### Community 99 - "background-task-tracker.ts"
Cohesion: 0.27
Nodes (6): snapshot(), backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint()

### Community 100 - "push-notification-service.ts"
Cohesion: 0.17
Nodes (9): PushSender, PushState, directories, RFC-8030, RFC-8030, sessionMuteSchema, subscriptionSchema, testNotificationSchema (+1 more)

### Community 101 - "SessionAdmissions"
Cohesion: 0.20
Nodes (4): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions

### Community 102 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 103 - "server/side-question.ts"
Cohesion: 0.27
Nodes (8): SIDE_QUESTION_CLEANUP_MS, SIDE_QUESTION_RUNTIME_IDLE_MS, SIDE_QUESTION_TIMEOUT_MS, sideQuestionBoundary(), sideQuestionPrompt(), SIDE_QUESTION_EARLIER_ANSWER_MAX_LENGTH, SIDE_QUESTION_EARLIER_LIMIT, SIDE_QUESTION_MAX_LENGTH

### Community 104 - "setupWorkspaceFixture"
Cohesion: 0.24
Nodes (6): pageFor(), createWorkspaceFixtureState(), fixtureBaseUrl(), fixtureValue(), setupWorkspaceFixture(), fixtureApi()

### Community 105 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 107 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 108 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 109 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 110 - "KnowledgePosition"
Cohesion: 0.36
Nodes (4): WorkspaceFixtureOptions, KnowledgePosition, KnowledgeRestoreState, base

### Community 111 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, packageManager, private, type, version

### Community 113 - "agent-service.test.ts"
Cohesion: 0.25
Nodes (6): terminalFormSteps(), configurableModel(), directories, services, TerminalCancelOptions, UserInputForm

### Community 114 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 115 - "render-workspace-gifs.ts"
Cohesion: 0.29
Nodes (6): directory, { values }, workflows, pnpm, onlyBuiltDependencies, ffmpeg-static

### Community 116 - "recovery-context.ts"
Cohesion: 0.38
Nodes (4): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief

### Community 117 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 118 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 119 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

## Knowledge Gaps
- **753 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+748 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1184 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **23 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `recordValue`, `recovery-resend-durability.test.ts`, `computer-manager.ts`, `contracts.ts`, `CopilotSessionLike`, `SessionFileUpload`, `background-task-adapter.ts`, `TerminalSessionController`, `.discoverTerminalSessions`, `.createSession`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **Why does `fixture()` connect `SessionStore` to `AgentService`, `session-store-providers.test.ts`, `SessionDetail`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionStore` to `AgentService`, `SessionDetail`, `computer-manager.ts`, `SessionFileUpload`, `TerminalSessionController`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _753 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.04442732408834104 - nodes in this community are weakly interconnected._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.030833682446585672 - nodes in this community are weakly interconnected._
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
- `docs/design/queue-batch.md`
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
