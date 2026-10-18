# Agentic Remote - Graphify code map

Snapshot: `69cb6c975b34405ec06bfcc26111b0340f80ae27e090c0379989a562ac0e293b`

Source checkout: `14373b0c2fa5f68098c2d5bca00712a5b8593781`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 282 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 282 files · ~571,377 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 4278 nodes · 12185 edges · 159 communities (126 shown, 18 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 840 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- api.ts
- App.tsx
- SessionStore
- App
- ClaudeAgentService
- .get
- computer-manager.ts
- AgentService
- background-task-adapter.ts
- sessionKey
- agentic-remote-promotion-monitor
- transcription-service.ts
- agent-service.ts
- claude-agent-service.ts
- ManagerAgent
- ManagedSession
- ManagerAssistant.tsx
- SessionService
- terminal-session.ts
- FakeSessionService
- active-sessions.ts
- session-presentation.ts
- queued-provider-dispatch.test.ts
- session-knowledge-routes.test.ts
- markdown-navigation.ts
- app.ts
- ComputerManager
- ProviderSessionService
- multi-node.test.ts
- TmuxTerminalSessionController
- SessionDetail
- pwa.ts
- bundle
- tmux-test-helpers.ts
- lib.rs
- shell.ts
- hub-routes.ts
- manager-agent.ts
- agentic-remote-promotion-setup
- config.rs
- cleanDialogLine
- devDependencies
- agentic-remote
- dependencies
- session-store.ts
- terminal-session.test.ts
- .publishError
- manager.ts
- terminal-startup-queue.test.ts
- CopilotClientLike
- provider-session-service.ts
- SessionOrderStore
- contracts.ts
- manager-store.ts
- queue-batch-benchmark.ts
- cli-canary.ts
- ManagerStore
- scripts
- session-service.ts
- KnowledgeStore
- compilerOptions
- session-enqueue-clear.test.ts
- CopilotSessionLike
- .toolHost
- SessionKnowledgeStore
- session-resource-clear.test.ts
- react
- shared/queue-batch.ts
- ComputerSummary
- session-knowledge-store.ts
- session-store-providers.test.ts
- .sendInternal
- capture-workspace.ts
- session-clear-transcript.test.ts
- PromptCards.tsx
- knowledge-tree.ts
- compilerOptions
- use-oracle-settings.ts
- session-reply-durability.test.ts
- compilerOptions
- compilerOptions
- session-resource-routes.test.ts
- manager-context.ts
- ManagerMemory
- workspace-browser.ts
- SessionKnowledgeBinding
- normalizeKnowledgeRelativePath
- server/side-question.ts
- BackgroundTaskSnapshot
- ReaderWorkspace
- workspace-fixtures.ts
- terminal-form-deadline.test.ts
- recovery-resend-durability.test.ts
- NewSessionDialog
- capture
- check-workspace-review-regressions.ts
- desktop.json
- agent-service-queue-batch.test.ts
- queued-dispatch.test.ts
- registerSessionKnowledgeRoutes
- capture-workbench-review.ts
- .oxlintrc.json
- settings-local.json
- promotion-monitor.test.ts
- session-resource-providers.test.ts
- scripts
- recovery-seed-guards.test.ts
- BackgroundTasksDialog.tsx
- html-preview.ts
- session-knowledge-routes.ts
- setupWorkspaceFixture
- generate-pwa-icons.ts
- bridge.rs
- screenshot-stability.test.ts
- promotion-setup-execution.test.ts
- session-knowledge-store.test.ts
- KnowledgePosition
- package.json
- release-publication.test.ts
- session-store-durability.test.ts
- render-workspace-gifs.ts
- recovery-context.ts
- settings.ts
- composer-layout.test.ts
- MarkdownCodeBlock.tsx
- api-origin.test.ts
- hub-routes.test.ts
- FakeRecorder
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
1. `SessionDetail` - 286 edges
2. `App()` - 267 edges
3. `AgentService` - 252 edges
4. `SessionStore` - 175 edges
5. `ClaudeAgentService` - 128 edges
6. `ManagedSession` - 92 edges
7. `ComputerManager` - 84 edges
8. `registerHubRoutes()` - 81 edges
9. `SessionService` - 73 edges
10. `TmuxTerminalSessionController` - 69 edges

## Surprising Connections (you probably didn't know these)
- `submit()` --indirect_call--> `provider()`  [INFERRED]
  src/App.tsx → server/provider-session-service.test.ts
- `composerKeyDown()` --indirect_call--> `composer()`  [INFERRED]
  src/App.tsx → server/terminal-send-uncertainty.test.ts
- `AcceptedSdkReply` --references--> `SessionDetail`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `PendingClaudeReply` --references--> `SessionDetail`  [EXTRACTED]
  server/claude-agent-service.ts → shared/contracts.ts
- `RemoteSessionListing` --references--> `ManagedSession`  [EXTRACTED]
  server/computer-manager.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (159 total, 18 thin omitted)

### Community 0 - "api.ts"
Cohesion: 0.03
Nodes (112): ManagedSessionMcpServersSnapshot, ManagedSessionSkillsSnapshot, parseSubmissionReceipt(), submissionReceiptFromError(), addKnowledgeRoot(), bootstrapSessionOrder(), cancelBackgroundTask(), cancelSession() (+104 more)

### Community 1 - "App.tsx"
Cohesion: 0.03
Nodes (99): addComputer(), removeComputer(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage() (+91 more)

### Community 2 - "SessionStore"
Cohesion: 0.04
Nodes (35): fixture(), connect(), createStore(), deferred(), disk, enqueue(), fixture(), fixtures (+27 more)

### Community 3 - "App"
Cohesion: 0.03
Nodes (91): isManagerEvent(), askSession(), deleteKnowledgeRoot(), listKnowledgeEntries(), readKnowledgeFile(), replyUserInput(), restartSession(), retryQueuedDispatch() (+83 more)

### Community 4 - "ClaudeAgentService"
Cohesion: 0.05
Nodes (11): ClaudeAgentService, isMissingClaudeSessionError(), cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle() (+3 more)

### Community 5 - ".get"
Cohesion: 0.07
Nodes (7): isUncertainDelivery(), preparePrompt(), queueConflict(), TerminalSessionController, hasRunningBackgroundAgent(), PendingPermission, deliveryUncertaintyFromError()

### Community 6 - "computer-manager.ts"
Cohesion: 0.04
Nodes (39): ComputerManagerEvents, RemoteResync, RemoteSessionListing, RemoteSessionRead, AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, DEFINITE_DISPATCH_REFUSALS, normalizeNodeUrl() (+31 more)

### Community 7 - "AgentService"
Cohesion: 0.05
Nodes (12): AgentService, foregroundTurnOpen(), isForegroundCompletionEvent(), isForegroundLifecycleEvent(), setup(), restart(), RuntimeConfigurationError, fixture() (+4 more)

### Community 8 - "background-task-adapter.ts"
Cohesion: 0.05
Nodes (74): DeferredSession, addActivity(), attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), boundedText() (+66 more)

### Community 9 - "sessionKey"
Cohesion: 0.06
Nodes (80): recoverConversation(), activeComposerPastes(), adoptConversationReplacement(), appendComposerForKey(), applySession(), askAboutKnowledgeFile(), cancelQueuedPromptEdit(), clearSelectedConversation() (+72 more)

### Community 10 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (71): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+63 more)

### Community 11 - "transcription-service.ts"
Cohesion: 0.05
Nodes (39): BuildAppOptions, collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation (+31 more)

### Community 12 - "agent-service.ts"
Cohesion: 0.06
Nodes (61): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, ansiSequence (+53 more)

### Community 13 - "claude-agent-service.ts"
Cohesion: 0.09
Nodes (51): AgentServiceEvents, AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput (+43 more)

### Community 14 - "ManagerAgent"
Cohesion: 0.08
Nodes (13): checkContent(), delay(), errorMessage(), isNotFound(), isPending(), isQueued(), ManagerAgent, ManagerSdkSession (+5 more)

### Community 15 - "ManagedSession"
Cohesion: 0.07
Nodes (32): APPROVE_WORDS, computerField, createManagerTools(), define(), deliver(), requireComputer(), resolveSession(), trustFolder() (+24 more)

### Community 16 - "ManagerAssistant.tsx"
Cohesion: 0.07
Nodes (45): ManagerSessionRef, ManagerSnapshot, ManagerStatus, cancelManager(), editQueuedManagerMessage(), getManager(), removeQueuedManagerMessage(), resetManager() (+37 more)

### Community 17 - "SessionService"
Cohesion: 0.07
Nodes (11): ActiveClaudeQuery, registerNodeRoutes(), releases, session, snapshot, readServiceResources(), readSessionMcpServers(), readSessionSkills() (+3 more)

### Community 18 - "terminal-session.ts"
Cohesion: 0.06
Nodes (54): boxedComposerFrame(), captureTerminal(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFocusWitnessed(), composerFrameText(), composerHasFocus(), composerRowText() (+46 more)

### Community 19 - "FakeSessionService"
Cohesion: 0.05
Nodes (9): CreationRuntime, FakeSessionService, provider(), AgentMode, AgentProvider, ConfigureRuntimeInput, RuntimeReasoningEffort, SideQuestionExchange (+1 more)

### Community 20 - "active-sessions.ts"
Cohesion: 0.07
Nodes (44): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates(), isCopilotProcess() (+36 more)

### Community 21 - "session-presentation.ts"
Cohesion: 0.08
Nodes (44): SessionExecutionMode, KnowledgeRootSelector(), root, SessionFilter, sessionNavigationView, attentionRank, computerTone(), executionModeName() (+36 more)

### Community 22 - "queued-provider-dispatch.test.ts"
Cohesion: 0.07
Nodes (26): acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight(), QueuedDelivery, QueuedDispatches (+18 more)

### Community 23 - "session-knowledge-routes.test.ts"
Cohesion: 0.07
Nodes (22): ServerRole, SessionMetadataLookup, brief(), HubEventSource, PushNotificationService, PushSender, PushState, directories (+14 more)

### Community 24 - "markdown-navigation.ts"
Cohesion: 0.08
Nodes (41): executeCommand(), listWorkspace(), readWorkspaceFile(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink(), KnowledgeReader() (+33 more)

### Community 25 - "app.ts"
Cohesion: 0.06
Nodes (39): buildApp(), errorStatusCode(), isAppleTouchIconProbe(), FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions (+31 more)

### Community 26 - "ComputerManager"
Cohesion: 0.16
Nodes (4): ComputerManager, managedSession(), registerHubRoutes(), ManagedRemovedQueuedPrompt

### Community 27 - "ProviderSessionService"
Cohesion: 0.08
Nodes (6): ProviderSessionService, closers, directories, heldSession(), local, runtime()

### Community 28 - "multi-node.test.ts"
Cohesion: 0.06
Nodes (18): fixture(), managers, releases, remote, session(), ComputerRegistry, RegistryState, directories (+10 more)

### Community 29 - "TmuxTerminalSessionController"
Cohesion: 0.12
Nodes (12): copilotCommand(), endProbeSession(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand(), processIsAlive(), safeWindowName() (+4 more)

### Community 30 - "SessionDetail"
Cohesion: 0.11
Nodes (7): persistedFormAnswer(), TerminalFormContinuation, copilotRequest(), TerminalFormReplyError, PendingUserInput, SessionDetail, UserInputReplyInput

### Community 31 - "pwa.ts"
Cohesion: 0.09
Nodes (39): directories, AppVersion, parseAppVersion(), deletePushSubscription(), getPushPublicKey(), savePushSubscription(), sendTestPushNotification(), applyPwaUpdate() (+31 more)

### Community 32 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 33 - "tmux-test-helpers.ts"
Cohesion: 0.12
Nodes (35): directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), exec, formFixture(), horizontalFormFixture() (+27 more)

### Community 34 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 35 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 36 - "hub-routes.ts"
Cohesion: 0.06
Nodes (38): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+30 more)

### Community 37 - "manager-agent.ts"
Cohesion: 0.07
Nodes (18): ManagerEventSource, discover(), ManagerAgentOptions, ManagerSdkClient, ManagerSdkEvent, ManagerSdkSessionConfig, Rung, Behavior (+10 more)

### Community 38 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 39 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 40 - "cleanDialogLine"
Cohesion: 0.13
Nodes (31): activeBottomFrame(), cleanDialogLine(), clearAutomaticStartupPrompts(), containsCopiedInteractiveFrame(), desktopInstallPromptIdentity(), findTerminalWrappedText(), FormReplyDeadlineError, hasClippedTerminalFormTabs() (+23 more)

### Community 41 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 42 - "agentic-remote"
Cohesion: 0.13
Nodes (31): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+23 more)

### Community 43 - "dependencies"
Cohesion: 0.06
Nodes (33): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, @fastify/multipart, @fastify/static, @fastify/websocket, lucide-react (+25 more)

### Community 44 - "session-store.ts"
Cohesion: 0.06
Nodes (24): PendingTerminalQueueSettlement, holdProbe(), fixtures, gate(), releases, TerminalDiscoveryError, boots, [directory, backend, resultPath, phase = 'idle'] (+16 more)

### Community 45 - "terminal-session.test.ts"
Cohesion: 0.09
Nodes (27): composerHoldsOtherText(), composerTookPaste(), occurrences(), paneEvidenceCount(), paneShowsText(), parseTerminalUpdateNotice(), pasteCouldCollapse(), pastedPlaceholderCount() (+19 more)

### Community 46 - ".publishError"
Cohesion: 0.13
Nodes (4): agentMode(), isMissingSessionError(), removeCopilotSessionFiles(), observe()

### Community 47 - "manager.ts"
Cohesion: 0.11
Nodes (20): confirmationSchema, defaultsSchema, editSchema, effort, managerInputError(), ManagerRouteAgent, messageParams, registerManagerRoutes() (+12 more)

### Community 48 - "terminal-startup-queue.test.ts"
Cohesion: 0.13
Nodes (26): findActiveCopilotSessions(), appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs (+18 more)

### Community 49 - "CopilotClientLike"
Cohesion: 0.07
Nodes (16): CopilotClientLike, directories, fakeClient(), ForkRequest, forkSession(), services, fixtures, recoverAndSeed() (+8 more)

### Community 50 - "provider-session-service.ts"
Cohesion: 0.09
Nodes (15): phases, port, ProviderSessionServiceEvents, createStartupPhases(), silentStartupPhases, startManagedServer(), StartupPhaseEvent, StartupPhaseRecord (+7 more)

### Community 51 - "SessionOrderStore"
Cohesion: 0.15
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 52 - "contracts.ts"
Cohesion: 0.08
Nodes (24): ActivityStatus, AddKnowledgeRootInput, BackgroundTaskAttachmentMode, BackgroundTaskExecutionMode, DispatchQueuedPromptInput, MessageRole, PermissionOption, PushSettings (+16 more)

### Community 53 - "manager-store.ts"
Cohesion: 0.15
Nodes (15): JournalRecorder, JournalRecorderOptions, Seen, sessionTask(), JournalDraft, JournalEntry, JournalKind, ManagerRegistry (+7 more)

### Community 54 - "queue-batch-benchmark.ts"
Cohesion: 0.11
Nodes (17): asJson, backends, benchClient(), BenchSession, delay(), idlePane, repeats, rows (+9 more)

### Community 55 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 56 - "ManagerStore"
Cohesion: 0.13
Nodes (4): openStore(), emptyState(), ManagerStore, open()

### Community 57 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 58 - "session-service.ts"
Cohesion: 0.18
Nodes (13): DirectoryScope, displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin() (+5 more)

### Community 59 - "KnowledgeStore"
Cohesion: 0.18
Nodes (7): WorkspaceFixtureState, KnowledgeRootReservation, KnowledgeState, KnowledgeStore, directories, fixture(), KnowledgeRoot

### Community 60 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 61 - "session-enqueue-clear.test.ts"
Cohesion: 0.11
Nodes (19): ClaudeSdk, build(), trusted, deferred(), disk, enqueue(), fixtures, holdAdmissionWrite() (+11 more)

### Community 62 - "CopilotSessionLike"
Cohesion: 0.12
Nodes (12): CopilotSessionLike, terminalFormSteps(), configurableModel(), directories, FakeCopilotClient, probeService(), services, startupFifoFixture() (+4 more)

### Community 63 - ".toolHost"
Cohesion: 0.12
Nodes (4): ManagerHub, PermissionReplyInput, RenameSessionInput, SendMessageInput

### Community 64 - "SessionKnowledgeStore"
Cohesion: 0.19
Nodes (3): bindingKey(), SessionKnowledgeRecoveryError, SessionKnowledgeStore

### Community 65 - "session-resource-clear.test.ts"
Cohesion: 0.13
Nodes (20): apps, directories, directory(), obstructUploads(), pairedFixture(), providerFixture(), providers, seed() (+12 more)

### Community 66 - "react"
Cohesion: 0.13
Nodes (13): react, ManagedQueuedBatch, QueueBatchReceipt, DialogFrame(), drawDiagram(), drawing, MermaidDiagram(), newBatchId() (+5 more)

### Community 67 - "shared/queue-batch.ts"
Cohesion: 0.17
Nodes (15): nothingQueued(), queueBatchDigest(), queueBatchItems(), count(), QUEUE_BATCH_BODY_LIMIT, QUEUE_BATCH_MAX_CHARACTERS, QUEUE_BATCH_MAX_PROMPTS, QUEUE_BATCH_REMEMBERED (+7 more)

### Community 68 - "ComputerSummary"
Cohesion: 0.16
Nodes (5): sessionAtLeastAsNew(), RegisteredComputer, TurnContextInput, createHub(), ComputerSummary

### Community 69 - "session-knowledge-store.ts"
Cohesion: 0.10
Nodes (20): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+12 more)

### Community 70 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (11): claude(), clearFixture(), copilot(), disk, event(), fixture(), fixtures, holdOtherWrite() (+3 more)

### Community 71 - ".sendInternal"
Cohesion: 0.19
Nodes (12): capturePane(), composerHoldsText(), composerText(), isTerminalAgentWorking(), isTerminalLoading(), isTerminalOverlay(), isTerminalSessionInUsePrompt(), isTerminalVisiblyIdle() (+4 more)

### Community 72 - "capture-workspace.ts"
Cohesion: 0.20
Nodes (20): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+12 more)

### Community 73 - "session-clear-transcript.test.ts"
Cohesion: 0.11
Nodes (9): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions, disk, fixtures, gate(), holdTurnWrite() (+1 more)

### Community 74 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (19): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+11 more)

### Community 75 - "knowledge-tree.ts"
Cohesion: 0.17
Nodes (18): WorkspaceEntry, knowledgeTreeKeyDown(), toggleKnowledgeFolder(), collapseKnowledgeFolder(), expandKnowledgeFolder(), knowledgeAncestors(), KnowledgeCrumb, knowledgeCrumbs() (+10 more)

### Community 76 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 77 - "use-oracle-settings.ts"
Cohesion: 0.16
Nodes (12): RuntimeModelOption, updateManagerSettings(), effortFrom(), efforts, OracleModelSettings(), OracleSettingsStatus(), HarnessProps, models (+4 more)

### Community 78 - "session-reply-durability.test.ts"
Cohesion: 0.17
Nodes (16): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRunFixture() (+8 more)

### Community 79 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 80 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 81 - "session-resource-routes.test.ts"
Cohesion: 0.13
Nodes (9): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription (+1 more)

### Community 82 - "manager-context.ts"
Cohesion: 0.20
Nodes (14): ago(), attentionRank(), buildTurnContext(), changeLines(), clock(), MANAGER_SYSTEM_PROMPT, managerPrompt(), oneLine() (+6 more)

### Community 83 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 84 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 85 - "SessionKnowledgeBinding"
Cohesion: 0.20
Nodes (13): SessionKnowledgeBinding, getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey(), knowledgePositionForBinding() (+5 more)

### Community 86 - "normalizeKnowledgeRelativePath"
Cohesion: 0.22
Nodes (15): joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath(), slashPath(), scopedKnowledgeRoot(), KnowledgeRootChoice (+7 more)

### Community 87 - "server/side-question.ts"
Cohesion: 0.22
Nodes (10): SIDE_QUESTION_CLEANUP_MS, SIDE_QUESTION_RUNTIME_IDLE_MS, SIDE_QUESTION_TIMEOUT_MS, sideQuestionBoundary(), SideQuestionError, sideQuestionPrompt(), withSideQuestionTimeout(), SIDE_QUESTION_EARLIER_ANSWER_MAX_LENGTH (+2 more)

### Community 88 - "BackgroundTaskSnapshot"
Cohesion: 0.21
Nodes (8): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), hasActiveBackgroundTasks(), BackgroundTask, BackgroundTaskSnapshot

### Community 89 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 90 - "workspace-fixtures.ts"
Cohesion: 0.16
Nodes (14): CONTEXT_EXAMPLE, documents, FIXTURE_NOW, fixtureBackgroundTasks, fixtureEndpoints, fixtureKnowledgeListings, fixtureKnowledgePositions, fixtureKnowledgeRoots (+6 more)

### Community 91 - "terminal-form-deadline.test.ts"
Cohesion: 0.15
Nodes (12): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+4 more)

### Community 92 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 93 - "NewSessionDialog"
Cohesion: 0.20
Nodes (16): activateSession(), createSession(), listDirectories(), listHistory(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), moveSessionToBrowsedFolder() (+8 more)

### Community 94 - "capture"
Cohesion: 0.18
Nodes (15): releaseRecording(), shortcutKeys(), startRecording(), stopRecording(), binding(), bindingLabel(), capturableCode(), isModifierCode() (+7 more)

### Community 95 - "check-workspace-review-regressions.ts"
Cohesion: 0.14
Nodes (12): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+4 more)

### Community 96 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 97 - "agent-service-queue-batch.test.ts"
Cohesion: 0.14
Nodes (3): directories, services, TurnSession

### Community 98 - "queued-dispatch.test.ts"
Cohesion: 0.15
Nodes (7): deferred(), disk, fixtures, holdWrite(), prompt(), releases, target

### Community 99 - "registerSessionKnowledgeRoutes"
Cohesion: 0.30
Nodes (11): registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession(), recordReplacement() (+3 more)

### Community 100 - "capture-workbench-review.ts"
Cohesion: 0.17
Nodes (10): frame(), geometry, output, scratch, screenshot(), { values }, fixtureSessions, IDLE_SESSION_ID (+2 more)

### Community 101 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 102 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 103 - "promotion-monitor.test.ts"
Cohesion: 0.27
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 104 - "session-resource-providers.test.ts"
Cohesion: 0.19
Nodes (12): ClaudeMcpRead, copilotFixture(), deferred(), directory(), DiscoveredMcp, DiscoveredSkills, fixtures, Mcp (+4 more)

### Community 105 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+4 more)

### Community 106 - "recovery-seed-guards.test.ts"
Cohesion: 0.18
Nodes (8): bootLegacy(), directories, execute, pending, releases, SeedState, services, stores

### Community 107 - "BackgroundTasksDialog.tsx"
Cohesion: 0.27
Nodes (9): BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive(), taskStatusLabel() (+1 more)

### Community 108 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 109 - "session-knowledge-routes.ts"
Cohesion: 0.18
Nodes (6): Lineage, RegistrationGeneration, ReplacementEvidence, SessionKnowledgeLifecycle, sessionParams, updateSchema

### Community 110 - "setupWorkspaceFixture"
Cohesion: 0.24
Nodes (6): pageFor(), createWorkspaceFixtureState(), fixtureBaseUrl(), fixtureValue(), setupWorkspaceFixture(), fixtureApi()

### Community 111 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 112 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 113 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 114 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 115 - "session-knowledge-store.test.ts"
Cohesion: 0.25
Nodes (6): SessionKnowledgeConflictError, disk, fixture(), fixtures, releases, root()

### Community 116 - "KnowledgePosition"
Cohesion: 0.36
Nodes (4): WorkspaceFixtureOptions, KnowledgePosition, KnowledgeRestoreState, base

### Community 117 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, packageManager, private, type, version

### Community 118 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 119 - "session-store-durability.test.ts"
Cohesion: 0.29
Nodes (6): disk, fixtures, prompt(), ready(), releases, session()

### Community 120 - "render-workspace-gifs.ts"
Cohesion: 0.29
Nodes (6): directory, { values }, workflows, pnpm, onlyBuiltDependencies, ffmpeg-static

### Community 121 - "recovery-context.ts"
Cohesion: 0.38
Nodes (4): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief

### Community 122 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 123 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 124 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 125 - "api-origin.test.ts"
Cohesion: 0.40
Nodes (4): prefixes, session, trusted, untrusted

## Knowledge Gaps
- **765 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+760 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1202 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `SessionStore`, `.get`, `background-task-adapter.ts`, `session-store.ts`, `agent-service.ts`, `.publishError`, `claude-agent-service.ts`, `session-resource-routes.test.ts`, `queued-provider-dispatch.test.ts`, `server/side-question.ts`, `session-service.ts`, `multi-node.test.ts`, `SessionDetail`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `buildApp()` connect `app.ts` to `SessionStore`, `ClaudeAgentService`, `.get`, `AgentService`, `transcription-service.ts`, `ManagerAgent`, `SessionService`, `session-knowledge-routes.test.ts`, `ComputerManager`, `ProviderSessionService`, `multi-node.test.ts`, `pwa.ts`, `manager.ts`, `SessionOrderStore`, `manager-store.ts`, `cli-canary.ts`, `ManagerStore`, `KnowledgeStore`, `SessionKnowledgeStore`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionService` connect `SessionService` to `session-service.ts`, `provider-session-service.ts`, `computer-manager.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _765 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `api.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.031840796019900496 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.026634382566585957 - nodes in this community are weakly interconnected._
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
