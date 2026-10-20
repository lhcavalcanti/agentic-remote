# Agentic Remote - Graphify code map

Snapshot: `197e7f0e38a5e0f94da591648e2fc42267614abbe4412f4fe018d660393e3c12`

Source checkout: `1b81aec32e1e02d99c70e509d02c1dd8ebb0a7fa`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 315 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 315 files · ~626,414 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 4796 nodes · 13560 edges · 174 communities (139 shown, 18 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 891 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App
- SessionStore
- ClaudeAgentService
- App.tsx
- App.test.tsx
- .readAfterWrites
- SessionDetail
- contracts.ts
- claude-agent-service.ts
- terminal-session.ts
- background-task-adapter.ts
- ManagedSession
- agentic-remote-promotion-monitor
- agent-service.ts
- PushNotificationService
- queued-dispatch.test.ts
- api.ts
- markdown-navigation.ts
- session-presentation.ts
- manager-tools.ts
- manager-structured-memory-validation.ts
- .get
- ManagerAgent
- tmux-test-helpers.ts
- SessionService
- tmux-errors.integration.test.ts
- RemoteNodeClient
- app.ts
- manager-context.ts
- TmuxTerminalSessionController
- bundle
- session-store.ts
- ProviderSessionService
- lib.rs
- pwa.ts
- shell.ts
- workspace-fixtures.ts
- agentic-remote-promotion-setup
- config.rs
- hub-routes.ts
- transcription-service.ts
- SessionKnowledgeStore
- active-sessions.ts
- workspace-browser.ts
- dependencies
- devDependencies
- manager-structured-memory.ts
- FakeSessionService
- .sendInternal
- agentic-remote
- node-routes.ts
- terminal-session.test.ts
- src/settings-profile.ts
- agent-service.test.ts
- manager-agent.test.ts
- manager-agent.ts
- ManagerStructuredMemoryStore
- SessionOrderStore
- session-patch-browser.ts
- react
- terminal-startup-queue.test.ts
- CopilotClientLike
- ManagerStore
- settings-profile-store.ts
- shared/settings-profile.ts
- KnowledgeStore
- cli-canary.ts
- delegated-transcription-service.ts
- ChatMessage
- scripts
- manager-structured-memory-search.ts
- send-matrix.integration.test.ts
- SettingsProfileClient
- compilerOptions
- .toolHost
- manager-routes.ts
- ManagerAssistant.tsx
- ManagerAssistant
- capture-workspace.ts
- use-oracle-settings.ts
- session-clear-transcript.test.ts
- session-resource-clear.test.ts
- startup-phases.test.ts
- knowledgePathChain
- compilerOptions
- .startAdmitted
- session-reply-durability.test.ts
- compilerOptions
- HubEvent
- compilerOptions
- server/side-question.ts
- directory-browser.ts
- BackgroundTaskSnapshot
- session-store-providers.test.ts
- normalizeKnowledgeRelativePath
- capture
- ManagerMemory
- NewSessionDialog
- session-knowledge-store.ts
- use-session-knowledge-root.ts
- session-latency-benchmark.ts
- refusal-metrics.ts
- ReaderWorkspace
- terminal-form-deadline.test.ts
- recovery-resend-durability.test.ts
- session-resource-routes.test.ts
- send-policy.test.ts
- scripts
- desktop.json
- theme-contrast.test.ts
- capture-workbench-review.ts
- .oxlintrc.json
- settings-local.json
- promotion-monitor.test.ts
- registerSessionKnowledgeRoutes
- session-response-order.ts
- recovery-seed-guards.test.ts
- BackgroundTasksDialog.tsx
- html-preview.ts
- session-knowledge-routes.ts
- composerHoldsText
- generate-pwa-icons.ts
- session-enqueue-clear.test.ts
- bridge.rs
- transcribeAudio
- screenshot-stability.test.ts
- KnowledgePosition
- promotion-setup-execution.test.ts
- session-store-durability.test.ts
- settings-profile.test.ts
- package.json
- ClientPresence
- manager-structured-memory-performance.test.ts
- release-publication.test.ts
- UserInputFieldControl
- render-workspace-gifs.ts
- history-projection.test.ts
- settings-profile-routes.ts
- settings.ts
- .transport
- composer-layout.test.ts
- usePanelWidth
- FakeRecorder
- vite.config.ts
- terminal-send-uncertainty.test.ts
- version-policy.test.ts
- MermaidDiagram.test.tsx
- tsconfig.json
- ffprobe-static
- lucide-react
- pdfjs-dist
- react
- remark-gfm
- remark-parse
- sw.js
- recovery-question-styles.test.ts
- agentic-remote-shell

## God Nodes (most connected - your core abstractions)
1. `SessionDetail` - 299 edges
2. `App()` - 269 edges
3. `AgentService` - 261 edges
4. `SessionStore` - 178 edges
5. `ClaudeAgentService` - 124 edges
6. `ManagedSession` - 98 edges
7. `registerHubRoutes()` - 91 edges
8. `ComputerManager` - 86 edges
9. `SessionService` - 73 edges
10. `ManagerAgent` - 72 edges

## Surprising Connections (you probably didn't know these)
- `composerKeyDown()` --indirect_call--> `composer()`  [INFERRED]
  src/App.tsx → server/terminal-send-uncertainty.test.ts
- `AcceptedSdkReply` --references--> `SessionDetail`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `CreationRuntime` --references--> `RuntimeReasoningEffort`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `AgentServiceEvents` --references--> `ServerEvent`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `PendingClaudeReply` --references--> `SessionDetail`  [EXTRACTED]
  server/claude-agent-service.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (174 total, 18 thin omitted)

### Community 0 - "App"
Cohesion: 0.04
Nodes (135): askSession(), deleteKnowledgeRoot(), replyPermission(), saveSessionVisibility(), activeComposerPastes(), App(), adoptConversationReplacement(), appendComposerForKey() (+127 more)

### Community 1 - "SessionStore"
Cohesion: 0.04
Nodes (49): fixture(), holdProbe(), fixtures, gate(), releases, restart(), fixture(), connect() (+41 more)

### Community 2 - "ClaudeAgentService"
Cohesion: 0.04
Nodes (28): ClaudeAgentService, isMissingClaudeSessionError(), cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle() (+20 more)

### Community 3 - "App.tsx"
Cohesion: 0.03
Nodes (93): ActivityStatus, AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph() (+85 more)

### Community 4 - "App.test.tsx"
Cohesion: 0.03
Nodes (83): addKnowledgeRoot(), bootstrapSessionOrder(), cancelBackgroundTask(), cancelSession(), clearConversation(), configureRetention(), configureRuntime(), fetchSessionOrder() (+75 more)

### Community 5 - ".readAfterWrites"
Cohesion: 0.05
Nodes (7): terminalAnswerRefused(), queueConflict(), isRetainedRefusal(), TerminalSessionController, hasRunningBackgroundAgent(), PendingPermission, PendingUserInput

### Community 6 - "SessionDetail"
Cohesion: 0.06
Nodes (13): agentMode(), AgentService, foregroundTurnOpen(), isForegroundCompletionEvent(), isForegroundLifecycleEvent(), isUncertainDelivery(), persistedFormAnswer(), RuntimeConfigurationError (+5 more)

### Community 7 - "contracts.ts"
Cohesion: 0.05
Nodes (48): TerminalFormContinuation, ClaudeAgentServiceEvents, RemoteResync, RemoteSessionListing, RemoteSessionRead, sessionAtLeastAsNew(), DirectoryScope, directories (+40 more)

### Community 8 - "claude-agent-service.ts"
Cohesion: 0.07
Nodes (60): AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission, PendingClaudeReply (+52 more)

### Community 9 - "terminal-session.ts"
Cohesion: 0.05
Nodes (73): boxedComposerFrame(), captureTerminal(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFocusWitnessed(), composerFrameText(), composerHasFocus(), composerRowText() (+65 more)

### Community 10 - "background-task-adapter.ts"
Cohesion: 0.07
Nodes (70): addActivity(), attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), boundedText(), CopilotClientTaskInfo (+62 more)

### Community 11 - "ManagedSession"
Cohesion: 0.10
Nodes (12): ComputerManager, managedSession(), mapWithConcurrency(), RegisteredComputer, registerHubRoutes(), SessionMuteCarrier, TurnContextInput, FakeManager (+4 more)

### Community 12 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (71): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+63 more)

### Community 13 - "agent-service.ts"
Cohesion: 0.06
Nodes (65): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, AgentServiceEvents (+57 more)

### Community 14 - "PushNotificationService"
Cohesion: 0.06
Nodes (31): ManagerEventSource, brief(), HubEventSource, OracleEventSource, PushNotificationService, PushPolicy, PushSender, PushState (+23 more)

### Community 15 - "queued-dispatch.test.ts"
Cohesion: 0.05
Nodes (32): acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight(), preparePrompt(), QueuedDelivery (+24 more)

### Community 16 - "api.ts"
Cohesion: 0.06
Nodes (51): RemoteNodeRedirectError, RemoteNodeRequestError, AddKnowledgeRootInput, ManagedSessionMcpServersSnapshot, ManagedSessionSkillsSnapshot, PushSettings, SessionMcpServerSummary, SessionResourceSource (+43 more)

### Community 17 - "markdown-navigation.ts"
Cohesion: 0.06
Nodes (51): UserInputField, UserInputFieldValue, executeCommand(), listWorkspace(), readWorkspaceFile(), ChangeDirectoryDialog(), browseDirectory(), submit() (+43 more)

### Community 18 - "session-presentation.ts"
Cohesion: 0.07
Nodes (50): saveSessionOrderLane(), handleDragEnd(), KnowledgeRootSelector(), root, reorderSessionLaneWithHiddenFollowers(), SessionFilter, sessionNavigationView, computers (+42 more)

### Community 19 - "manager-tools.ts"
Cohesion: 0.07
Nodes (30): APPROVE_WORDS, computerField, createManagerTools(), define(), deliver(), requireComputer(), resolveSession(), structuredTools() (+22 more)

### Community 20 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 21 - ".get"
Cohesion: 0.09
Nodes (5): isMissingSessionError(), removeCopilotSessionFiles(), holdOtherWrite(), TranscriptObservation, hasActiveBackgroundTasks()

### Community 22 - "ManagerAgent"
Cohesion: 0.10
Nodes (11): checkContent(), delay(), discover(), errorMessage(), isNotFound(), ManagerAgent, TurnError, withTimeout() (+3 more)

### Community 23 - "tmux-test-helpers.ts"
Cohesion: 0.08
Nodes (43): directories, execFileAsync, processExists(), procStatReads, tmuxSessions, waitForProcessExit(), exec, formFixture() (+35 more)

### Community 24 - "SessionService"
Cohesion: 0.07
Nodes (10): ActiveClaudeQuery, registerNodeRoutes(), releases, session, snapshot, readServiceResources(), readSessionSkills(), ResourceReads (+2 more)

### Community 25 - "tmux-errors.integration.test.ts"
Cohesion: 0.06
Nodes (30): ServerRole, fixture(), managers, releases, remote, session(), SessionMetadataLookup, ComputerRegistry (+22 more)

### Community 26 - "RemoteNodeClient"
Cohesion: 0.06
Nodes (11): headerSafe(), RemoteNodeClient, client(), servers, session, NodeInfo, RemovedQueuedPrompt, WorkspaceFile (+3 more)

### Community 27 - "app.ts"
Cohesion: 0.07
Nodes (29): prefixes, session, trusted, untrusted, directories, buildApp(), BuildAppOptions, errorStatusCode() (+21 more)

### Community 28 - "manager-context.ts"
Cohesion: 0.09
Nodes (30): ago(), attentionRank(), buildTurnContext(), changeLines(), clock(), MANAGER_STRUCTURED_MEMORY_SYSTEM_PROMPT, managerPrompt(), oneLine() (+22 more)

### Community 29 - "TmuxTerminalSessionController"
Cohesion: 0.12
Nodes (12): startAgentAfterClear(), copilotCommand(), endProbeSession(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand(), safeWindowName() (+4 more)

### Community 30 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 31 - "session-store.ts"
Cohesion: 0.06
Nodes (31): PendingTerminalQueueSettlement, TerminalDiscoveryError, idleDaysSchema, mergeSessionRetention(), sessionRetentionPatchSchema, sessionRetentionSchema, archivedMessage(), DiscoveredSession (+23 more)

### Community 33 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 34 - "pwa.ts"
Cohesion: 0.10
Nodes (36): deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate(), toggle() (+28 more)

### Community 35 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 36 - "workspace-fixtures.ts"
Cohesion: 0.08
Nodes (30): pageFor(), accents, Measurement, originalDocument, output, report, save(), scratch (+22 more)

### Community 37 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 38 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 39 - "hub-routes.ts"
Cohesion: 0.06
Nodes (37): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+29 more)

### Community 40 - "transcription-service.ts"
Cohesion: 0.09
Nodes (23): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+15 more)

### Community 41 - "SessionKnowledgeStore"
Cohesion: 0.11
Nodes (12): bindingKey(), SessionKnowledgeConflictError, SessionKnowledgePersistenceError, SessionKnowledgeRecoveryError, SessionKnowledgeStore, stateWithPaths(), disk, fixture() (+4 more)

### Community 42 - "active-sessions.ts"
Cohesion: 0.11
Nodes (31): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+23 more)

### Community 43 - "workspace-browser.ts"
Cohesion: 0.10
Nodes (29): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+21 more)

### Community 44 - "dependencies"
Cohesion: 0.06
Nodes (35): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/static, @fastify/websocket (+27 more)

### Community 45 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 46 - "manager-structured-memory.ts"
Cohesion: 0.08
Nodes (28): ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryStoreOptions, openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS (+20 more)

### Community 47 - "FakeSessionService"
Cohesion: 0.08
Nodes (4): FakeSessionService, routingFixture(), session(), temporaryDirectory()

### Community 48 - ".sendInternal"
Cohesion: 0.16
Nodes (25): activeBottomFrame(), captureBeforeDeadline(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), containsCopiedInteractiveFrame(), desktopInstallPromptIdentity(), findTerminalWrappedText() (+17 more)

### Community 49 - "agentic-remote"
Cohesion: 0.13
Nodes (31): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+23 more)

### Community 50 - "node-routes.ts"
Cohesion: 0.07
Nodes (29): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile(), AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER (+21 more)

### Community 51 - "terminal-session.test.ts"
Cohesion: 0.09
Nodes (24): parseTerminalUpdateNotice(), submitTerminalForm(), terminalChecklistState(), terminalFormCommitKeys(), bracketedTabPane, clearFixture(), deliveryFixture(), desktopInstallPane (+16 more)

### Community 52 - "src/settings-profile.ts"
Cohesion: 0.09
Nodes (25): AppearanceSetting, NewSessionRuntime, SETTINGS_MAX_COMPUTERS, SettingsChange, SettingsProfileKey, settingsProfileKeys, SettingsProfileValues, SettingsUpdateResult (+17 more)

### Community 53 - "agent-service.test.ts"
Cohesion: 0.08
Nodes (14): terminalFormSteps(), configurableModel(), DeferredSession, directories, FakeCopilotClient, probeService(), services, startupFifoFixture() (+6 more)

### Community 54 - "manager-agent.test.ts"
Cohesion: 0.08
Nodes (14): ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig, Behavior, computers, fail(), FakeClient (+6 more)

### Community 55 - "manager-agent.ts"
Cohesion: 0.10
Nodes (20): isPending(), isQueued(), ManagerAgentOptions, Rung, sameRuntime(), TURN_ACTIVITY, ManagerState, isManagerEvent() (+12 more)

### Community 56 - "ManagerStructuredMemoryStore"
Cohesion: 0.18
Nodes (9): capturePrompt(), digest(), isMissing(), ManagerStructuredMemoryRecoveryError, ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryStore, open(), ManagerStructuredMemoryMutationResult (+1 more)

### Community 57 - "SessionOrderStore"
Cohesion: 0.15
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 58 - "session-patch-browser.ts"
Cohesion: 0.13
Nodes (27): advance(), Connection, connections, content(), FrameMeasurement, instrument(), lastHeading(), message() (+19 more)

### Community 59 - "react"
Cohesion: 0.09
Nodes (14): react, SessionRetention, DocumentViewControls(), actions, outline, DocumentHeading, MarkdownCodeBlock(), copy() (+6 more)

### Community 60 - "terminal-startup-queue.test.ts"
Cohesion: 0.14
Nodes (25): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+17 more)

### Community 61 - "CopilotClientLike"
Cohesion: 0.08
Nodes (15): CopilotClientLike, CopilotSessionLike, directories, fakeClient(), ForkRequest, forkSession(), services, CopilotTasksApi (+7 more)

### Community 62 - "ManagerStore"
Cohesion: 0.12
Nodes (4): openStore(), emptyState(), ManagerStore, open()

### Community 63 - "settings-profile-store.ts"
Cohesion: 0.13
Nodes (17): directories, fakeManager(), hub(), local, profileStore(), SettingsProfileState, SettingsProfileStore, directories (+9 more)

### Community 64 - "shared/settings-profile.ts"
Cohesion: 0.11
Nodes (26): AccentSetting, appearanceSettings, isRecord(), isSettingsRevision(), NewSessionFoldersSetting, NewSessionRuntimesSetting, oneOf(), oracleResponseStyles (+18 more)

### Community 65 - "KnowledgeStore"
Cohesion: 0.16
Nodes (8): WorkspaceFixtureState, KnowledgeRootReservation, KnowledgeState, KnowledgeStore, directories, fixture(), createHub(), KnowledgeRoot

### Community 66 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 67 - "delegated-transcription-service.ts"
Cohesion: 0.12
Nodes (13): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, transcriptionComputerName() (+5 more)

### Community 68 - "ChatMessage"
Cohesion: 0.13
Nodes (12): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, Client, Browser, seedOffset, ChatMessage (+4 more)

### Community 69 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 70 - "manager-structured-memory-search.ts"
Cohesion: 0.14
Nodes (22): authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord(), ManagerStructuredMemoryFormattedContext (+14 more)

### Community 71 - "send-matrix.integration.test.ts"
Cohesion: 0.08
Nodes (22): BUSY, CLEAR_REFUSED, client(), dialogs, Draft, drained, exec, Expected (+14 more)

### Community 72 - "SettingsProfileClient"
Cohesion: 0.19
Nodes (5): sameSettingValue(), errorText(), isRefusal(), samePending(), SettingsProfileClient

### Community 73 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 74 - ".toolHost"
Cohesion: 0.12
Nodes (4): ManagerHub, hasExplicitStructuredMemoryIntent(), memoryObject, StructuredMemoryMutationOperation

### Community 75 - "manager-routes.ts"
Cohesion: 0.12
Nodes (14): confirmationSchema, defaultsSchema, editSchema, effort, managerInputError(), ManagerRouteAgent, messageParams, registerManagerRoutes() (+6 more)

### Community 76 - "ManagerAssistant.tsx"
Cohesion: 0.12
Nodes (14): ManagerSessionRef, removeQueuedManagerMessage(), resetManager(), resolveManagerConfirmation(), retryManagerMessage(), sessionLinkTarget(), startOver(), OracleButton() (+6 more)

### Community 77 - "ManagerAssistant"
Cohesion: 0.13
Nodes (20): cancelManager(), editQueuedManagerMessage(), sendManagerMessage(), phoneEnterCreatesNewline(), applyEvent(), canTakeFocus(), ManagerAssistant(), act() (+12 more)

### Community 78 - "capture-workspace.ts"
Cohesion: 0.19
Nodes (21): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+13 more)

### Community 79 - "use-oracle-settings.ts"
Cohesion: 0.16
Nodes (13): RuntimeModelOption, getManager(), updateManagerSettings(), effortFrom(), efforts, OracleModelSettings(), OracleSettingsStatus(), HarnessProps (+5 more)

### Community 80 - "session-clear-transcript.test.ts"
Cohesion: 0.11
Nodes (9): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions, disk, fixtures, gate(), holdTurnWrite() (+1 more)

### Community 81 - "session-resource-clear.test.ts"
Cohesion: 0.10
Nodes (18): ClaudeSdk, deferred(), disk, enqueue(), fixtures, holdAdmissionWrite(), releases, apps (+10 more)

### Community 82 - "startup-phases.test.ts"
Cohesion: 0.12
Nodes (12): phases, port, createStartupPhases(), startManagedServer(), StartupPhaseEvent, StartupPhaseRecord, address, directories (+4 more)

### Community 83 - "knowledgePathChain"
Cohesion: 0.15
Nodes (21): listKnowledgeEntries(), readKnowledgeFile(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor(), knowledgeTreeKeyDown() (+13 more)

### Community 84 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 86 - "session-reply-durability.test.ts"
Cohesion: 0.16
Nodes (16): assistantFixture(), claudeFixture(), claudeQuestions(), claudeRunFixture(), copilotFixture(), copilotRunFixture(), disk, emptyComposer (+8 more)

### Community 87 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 88 - "HubEvent"
Cohesion: 0.18
Nodes (10): WorkspaceFixture, ComputerManagerEvents, diffMessages(), Publication, sameMessage(), sessionKey(), SessionPublications, SessionUpserted (+2 more)

### Community 89 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 90 - "server/side-question.ts"
Cohesion: 0.20
Nodes (10): SIDE_QUESTION_CLEANUP_MS, SIDE_QUESTION_RUNTIME_IDLE_MS, SIDE_QUESTION_TIMEOUT_MS, sideQuestionBoundary(), SideQuestionError, sideQuestionPrompt(), withSideQuestionTimeout(), SIDE_QUESTION_EARLIER_ANSWER_MAX_LENGTH (+2 more)

### Community 91 - "directory-browser.ts"
Cohesion: 0.23
Nodes (11): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin(), SessionDirectoryError (+3 more)

### Community 92 - "BackgroundTaskSnapshot"
Cohesion: 0.18
Nodes (7): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask, BackgroundTaskSnapshot

### Community 93 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (8): claude(), clearFixture(), copilot(), disk, event(), fixtures, releases, sdkSession()

### Community 94 - "normalizeKnowledgeRelativePath"
Cohesion: 0.22
Nodes (15): joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath(), slashPath(), scopedKnowledgeRoot(), KnowledgeRootChoice (+7 more)

### Community 95 - "capture"
Cohesion: 0.15
Nodes (18): releaseRecording(), shortcutKeys(), startRecording(), stopRecording(), binding(), bindingLabel(), capturableCode(), isModifierCode() (+10 more)

### Community 96 - "ManagerMemory"
Cohesion: 0.22
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 97 - "NewSessionDialog"
Cohesion: 0.17
Nodes (18): provider(), activateSession(), createSession(), listDirectories(), listHistory(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse() (+10 more)

### Community 98 - "session-knowledge-store.ts"
Cohesion: 0.12
Nodes (17): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+9 more)

### Community 99 - "use-session-knowledge-root.ts"
Cohesion: 0.19
Nodes (12): getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey(), knowledgePositionForBinding(), SessionIdentity (+4 more)

### Community 100 - "session-latency-benchmark.ts"
Cohesion: 0.24
Nodes (16): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+8 more)

### Community 101 - "refusal-metrics.ts"
Cohesion: 0.18
Nodes (15): countsAsRefusal(), DEFAULT_MAX_REFUSAL_KEYS, httpRefusalReason(), keyId(), notedReasons, noteRefusalReason(), overflowId, reasonCodeFromChain() (+7 more)

### Community 102 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 103 - "terminal-form-deadline.test.ts"
Cohesion: 0.15
Nodes (12): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+4 more)

### Community 104 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 105 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 106 - "send-policy.test.ts"
Cohesion: 0.16
Nodes (13): message(), sendLikeTheApp(), SessionExecutionMode, terminalSendOptions(), TerminalSendPolicyInput, TerminalSendRequestOptions, booleans, combinations (+5 more)

### Community 107 - "scripts"
Cohesion: 0.14
Nodes (14): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+6 more)

### Community 108 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 109 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 110 - "capture-workbench-review.ts"
Cohesion: 0.17
Nodes (10): frame(), geometry, output, scratch, screenshot(), { values }, fixtureSessions, IDLE_SESSION_ID (+2 more)

### Community 111 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 112 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 113 - "promotion-monitor.test.ts"
Cohesion: 0.27
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 114 - "registerSessionKnowledgeRoutes"
Cohesion: 0.33
Nodes (11): registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession(), recordReplacement() (+3 more)

### Community 115 - "session-response-order.ts"
Cohesion: 0.27
Nodes (11): sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), currentSessionEventSequence(), nextSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences (+3 more)

### Community 116 - "recovery-seed-guards.test.ts"
Cohesion: 0.18
Nodes (8): bootLegacy(), directories, execute, pending, releases, SeedState, services, stores

### Community 117 - "BackgroundTasksDialog.tsx"
Cohesion: 0.27
Nodes (9): BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive(), taskStatusLabel() (+1 more)

### Community 118 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 119 - "session-knowledge-routes.ts"
Cohesion: 0.18
Nodes (6): Lineage, RegistrationGeneration, ReplacementEvidence, SessionKnowledgeLifecycle, sessionParams, updateSchema

### Community 120 - "composerHoldsText"
Cohesion: 0.33
Nodes (11): composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), occurrences(), paneEvidenceCount(), paneShowsText(), pasteCouldCollapse() (+3 more)

### Community 121 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 122 - "session-enqueue-clear.test.ts"
Cohesion: 0.29
Nodes (9): disk, EnqueueCase, fixtures, gate(), holdEnqueue(), joinedEnqueue(), quiet(), releases (+1 more)

### Community 123 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 124 - "transcribeAudio"
Cohesion: 0.29
Nodes (4): transcribeAudio(), recordingDuration(), FakeRecorder, useVoiceRecorder()

### Community 125 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 126 - "KnowledgePosition"
Cohesion: 0.33
Nodes (5): WorkspaceFixtureOptions, KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 127 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 128 - "session-store-durability.test.ts"
Cohesion: 0.31
Nodes (7): disk, fixture(), fixtures, prompt(), ready(), releases, session()

### Community 129 - "settings-profile.test.ts"
Cohesion: 0.25
Nodes (4): resolveAppearance(), settingsProfileCacheKey, cached(), MemoryStorage

### Community 130 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, packageManager, private, type, version

### Community 132 - "manager-structured-memory-performance.test.ts"
Cohesion: 0.36
Nodes (5): benchmarkState(), now(), openFixture(), searchSamples(), ManagerStructuredMemorySearchResult

### Community 133 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 134 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 135 - "render-workspace-gifs.ts"
Cohesion: 0.29
Nodes (6): directory, { values }, workflows, pnpm, onlyBuiltDependencies, ffmpeg-static

### Community 136 - "history-projection.test.ts"
Cohesion: 0.33
Nodes (5): eventsFor(), ModelMessage, random(), seedOffset, terminalTypes

### Community 137 - "settings-profile-routes.ts"
Cohesion: 0.33
Nodes (6): deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, SETTINGS_DEVICE_ID_MAX_LENGTH

### Community 138 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 140 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 141 - "usePanelWidth"
Cohesion: 0.47
Nodes (6): boundWidth(), readWidth(), storeWidth(), usePanelWidth(), commit(), finish()

### Community 143 - "vite.config.ts"
Cohesion: 0.40
Nodes (3): canaryTests, packageVersion, tmuxTests

## Knowledge Gaps
- **895 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+890 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1362 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `SessionDetail` to `SessionStore`, `.readAfterWrites`, `contracts.ts`, `claude-agent-service.ts`, `background-task-adapter.ts`, `agent-service.ts`, `queued-dispatch.test.ts`, `.probeTerminalStartup`, `.get`, `.startAdmitted`, `server/side-question.ts`, `directory-browser.ts`, `session-store.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionStore` to `ClaudeAgentService`, `.readAfterWrites`, `SessionDetail`, `claude-agent-service.ts`, `agent-service.ts`, `queued-dispatch.test.ts`, `.get`, `.startAdmitted`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `buildApp()` connect `app.ts` to `SessionStore`, `ClaudeAgentService`, `ClientPresence`, `SessionDetail`, `ManagedSession`, `PushNotificationService`, `ManagerAgent`, `SessionService`, `tmux-errors.integration.test.ts`, `manager-context.ts`, `ProviderSessionService`, `transcription-service.ts`, `SessionKnowledgeStore`, `node-routes.ts`, `SessionOrderStore`, `ManagerStore`, `settings-profile-store.ts`, `KnowledgeStore`, `cli-canary.ts`, `delegated-transcription-service.ts`, `manager-routes.ts`, `refusal-metrics.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `App()` (e.g. with `createSettingsProfileClient()` and `prefersLightNow()`) actually correct?**
  _`App()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _895 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.036245444696148925 - nodes in this community are weakly interconnected._
- **Should `SessionStore` be split into smaller, more focused modules?**
  _Cohesion score 0.03678001387925052 - nodes in this community are weakly interconnected._
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
- `docs/design/settings-profile.md`
- `docs/mockups/activity-view.html`
- `docs/mockups/brand-logo.html`
- `docs/native-shell.md`
- `docs/provider-compatibility.md`
- `docs/sdk-architecture-roadmap.md`
- `docs/session-retention.md`
- `docs/slash-command-feedback.md`
- `docs/superpowers/plans/2026-10-16-oracle-structured-memory.md`
- `docs/superpowers/specs/2026-10-16-oracle-structured-memory-design.md`
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
