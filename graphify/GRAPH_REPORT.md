# Agentic Remote - Graphify code map

Snapshot: `5f328f94b4e776f65a4e1f61256ce836e0972f7014748bc14e6e7702059cba04`

Source checkout: `21544ff64b5b52e9656000419386f3bfa389225d`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 315 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 315 files · ~628,637 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 4806 nodes · 13589 edges · 176 communities (139 shown, 21 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 891 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App
- SessionStore
- AgentService
- api.ts
- SessionDetail
- App.tsx
- contracts.ts
- claude-agent-service.ts
- agentic-remote-promotion-monitor
- ManagedSession
- markdown-navigation.ts
- RemoteNodeClient
- terminal-session.ts
- PushNotificationService
- CopilotSessionLike
- BackgroundTaskSnapshot
- ManagerAgent
- manager-structured-memory-validation.ts
- .get
- manager-tools.ts
- TmuxTerminalSessionController
- terminal-startup-queue.test.ts
- session-patch-routes.test.ts
- agent-service.ts
- ManagerAssistant.tsx
- tmux-errors.integration.test.ts
- .sendInternal
- bundle
- ProviderSessionService
- app.ts
- TerminalSessionController
- hub-routes.ts
- pwa.ts
- SessionService
- lib.rs
- shell.ts
- workspace-fixtures.ts
- .clearSerialized
- agentic-remote-promotion-setup
- config.rs
- background-task-adapter.ts
- transcription-service.ts
- manager-agent.ts
- dependencies
- devDependencies
- session-resource-clear.test.ts
- FakeSessionService
- terminal-session.test.ts
- agentic-remote
- .handleSessionEvent
- node-routes.ts
- SessionKnowledgeStore
- sessionKey
- manager-agent.test.ts
- session-enqueue-clear.test.ts
- manager-structured-memory.ts
- SessionOrderStore
- manager-store.ts
- send-matrix.integration.test.ts
- settings-profile-store.ts
- session-patch-browser.ts
- KnowledgeStore
- session-reply-durability.test.ts
- cli-canary.ts
- ManagerStore
- manager-structured-memory-search.ts
- src/settings-profile.ts
- scripts
- active-sessions.ts
- noTmuxServer
- SessionResources.tsx
- shared/settings-profile.ts
- compilerOptions
- ManagerMessage
- SettingsProfileClient
- ManagerStructuredMemoryStore
- agent-service.test.ts
- .toolHost
- session-clear-transcript.test.ts
- session-knowledge-store.ts
- capture-workspace.ts
- use-oracle-settings.ts
- manager-context.ts
- submission-error.ts
- knowledge-tree.ts
- NewSessionDialog
- compilerOptions
- normalizeKnowledgeRelativePath
- session-store-providers.test.ts
- compilerOptions
- compilerOptions
- server/side-question.ts
- directory-browser.ts
- event-log.ts
- ManagerMemory
- .correct
- refusal-metrics.ts
- workspace-browser.ts
- react
- session-latency-benchmark.ts
- delegated-transcription-service.ts
- startup-phases.test.ts
- ReaderWorkspace
- background-task-stop.test.ts
- promotion-monitor.test.ts
- recovery-resend-durability.test.ts
- session-resource-routes.test.ts
- SettingsProfileStore
- check-workspace-review-regressions.ts
- terminal-form-deadline.test.ts
- scripts
- desktop.json
- TranscriptionService
- registerSessionKnowledgeRoutes
- theme-contrast.test.ts
- BackgroundTasksDialog.tsx
- .oxlintrc.json
- settings-local.json
- background-task-tracker.ts
- recovery-seed-guards.test.ts
- html-preview.ts
- eventString
- recordValue
- session-knowledge-routes.ts
- generate-pwa-icons.ts
- DeferredSession
- bridge.rs
- screenshot-stability.test.ts
- KnowledgePosition
- promotion-setup-execution.test.ts
- package.json
- release-publication.test.ts
- render-workspace-gifs.ts
- history-projection.test.ts
- settings-profile-routes.ts
- settings.ts
- composer-layout.test.ts
- recovery-context.ts
- settings-profile-routes.test.ts
- saveEdit
- MarkdownCodeBlock.tsx
- api-origin.test.ts
- FakeRecorder
- vite.config.ts
- .discoverTerminalSessions
- terminal-send-uncertainty.test.ts
- MockMediaRecorder
- version-policy.test.ts
- MockWebSocket
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
- `submit()` --indirect_call--> `provider()`  [INFERRED]
  src/App.tsx → server/provider-session-service.test.ts
- `composerKeyDown()` --indirect_call--> `composer()`  [INFERRED]
  src/App.tsx → server/terminal-send-uncertainty.test.ts
- `AcceptedSdkReply` --references--> `SessionDetail`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `CreationRuntime` --references--> `RuntimeReasoningEffort`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `BackgroundTaskUpdate` --references--> `BackgroundTaskSnapshot`  [EXTRACTED]
  server/background-task-tracker.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (176 total, 21 thin omitted)

### Community 0 - "App"
Cohesion: 0.03
Nodes (160): isManagerEvent(), alertNotification(), terminalSendOptions(), submissionReceiptFromError(), deleteKnowledgeRoot(), moveSessionToTmux(), readKnowledgeFile(), replyPermission() (+152 more)

### Community 1 - "SessionStore"
Cohesion: 0.03
Nodes (87): fixture(), holdProbe(), fixtures, gate(), releases, restart(), directories, fakeClient() (+79 more)

### Community 2 - "AgentService"
Cohesion: 0.05
Nodes (6): AgentService, RuntimeConfigurationError, queueConflict(), fixture(), httpBoundary(), isRetainedRefusal()

### Community 3 - "api.ts"
Cohesion: 0.04
Nodes (110): SettingsChange, SettingsProfileKey, SettingsUpdateResult, parseSubmissionReceipt(), addKnowledgeRoot(), askSession(), bootstrapSessionOrder(), cancelBackgroundTask() (+102 more)

### Community 4 - "SessionDetail"
Cohesion: 0.05
Nodes (9): ClaudeAgentService, isMissingClaudeSessionError(), observe(), assertSessionNotRetained(), clearRecoverySeedFailure(), QueuedPromptReservation, QueuedPrompt, QueuedPromptDispatchResult (+1 more)

### Community 5 - "App.tsx"
Cohesion: 0.03
Nodes (101): addComputer(), configureRuntime(), removeComputer(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation() (+93 more)

### Community 6 - "contracts.ts"
Cohesion: 0.03
Nodes (62): AgentServiceEvents, ClaudeAgentServiceEvents, DirectoryScope, directories, routingFixture(), session(), temporaryDirectory(), AUDIO_FILENAME_HEADER (+54 more)

### Community 7 - "claude-agent-service.ts"
Cohesion: 0.06
Nodes (68): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission (+60 more)

### Community 8 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (77): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url(), CANARY (+69 more)

### Community 9 - "ManagedSession"
Cohesion: 0.10
Nodes (13): ComputerManager, managedSession(), sessionAtLeastAsNew(), RegisteredComputer, registerHubRoutes(), SessionMuteCarrier, TurnContextInput, FakeManager (+5 more)

### Community 10 - "markdown-navigation.ts"
Cohesion: 0.05
Nodes (57): UserInputField, UserInputFieldValue, followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), MarkdownImage(), missingDocumentFragment(), WorkspaceDialog() (+49 more)

### Community 11 - "RemoteNodeClient"
Cohesion: 0.04
Nodes (17): RemoteResync, RemoteSessionRead, RemoteNodeClient, client(), servers, session, CreateSessionInput, NodeInfo (+9 more)

### Community 12 - "terminal-session.ts"
Cohesion: 0.05
Nodes (62): boxedComposerFrame(), captureTerminal(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFrameText(), composerHasFocus(), composerRowText(), cursorComposerFrame() (+54 more)

### Community 13 - "PushNotificationService"
Cohesion: 0.07
Nodes (28): brief(), HubEventSource, OracleEventSource, PushNotificationService, PushPolicy, PushSender, PushState, directories (+20 more)

### Community 14 - "CopilotSessionLike"
Cohesion: 0.05
Nodes (29): CopilotSessionLike, acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight(), preparePrompt() (+21 more)

### Community 15 - "BackgroundTaskSnapshot"
Cohesion: 0.07
Nodes (50): BackgroundTaskSnapshot, saveSessionOrderLane(), handleDragEnd(), KnowledgeRootSelector(), root, reorderSessionLaneWithHiddenFollowers(), SessionFilter, sessionNavigationView (+42 more)

### Community 16 - "ManagerAgent"
Cohesion: 0.10
Nodes (11): checkContent(), delay(), errorMessage(), isNotFound(), ManagerAgent, ManagerSdkSession, sameRuntime(), TurnError (+3 more)

### Community 17 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 18 - ".get"
Cohesion: 0.09
Nodes (7): isUncertainDelivery(), terminalAnswerRefused(), isTerminalAgentWorking(), isTerminalOverlay(), isTerminalSessionInUsePrompt(), isTerminalVisiblyIdle(), deliveryUncertaintyFromError()

### Community 19 - "manager-tools.ts"
Cohesion: 0.07
Nodes (29): APPROVE_WORDS, computerField, createManagerTools(), define(), deliver(), requireComputer(), resolveSession(), structuredTools() (+21 more)

### Community 20 - "TmuxTerminalSessionController"
Cohesion: 0.09
Nodes (16): startAgentAfterClear(), copilotCommand(), endProbeSession(), execFileAsync, formReplyExpired(), processAncestors(), processCommand(), processIsAlive() (+8 more)

### Community 21 - "terminal-startup-queue.test.ts"
Cohesion: 0.09
Nodes (41): directories, execFileAsync, processExists(), procStatReads, tmuxSessions, waitForProcessExit(), exec, formFixture() (+33 more)

### Community 22 - "session-patch-routes.test.ts"
Cohesion: 0.07
Nodes (24): Connection, ComputerManagerEvents, Client, apps, directories, FakeManager, fixture(), trusted (+16 more)

### Community 23 - "agent-service.ts"
Cohesion: 0.05
Nodes (44): AcceptedSdkReply, ActivePrompt, ActivityToolStart, ansiSequence, commandShortcut(), CreationRuntime, DeliveryBoundary, ElicitationContext (+36 more)

### Community 24 - "ManagerAssistant.tsx"
Cohesion: 0.08
Nodes (34): ManagerSessionRef, cancelManager(), removeQueuedManagerMessage(), resetManager(), resolveManagerConfirmation(), retryManagerMessage(), sendManagerMessage(), phoneEnterCreatesNewline() (+26 more)

### Community 25 - "tmux-errors.integration.test.ts"
Cohesion: 0.07
Nodes (26): ServerRole, fixture(), managers, releases, remote, session(), SessionMetadataLookup, ComputerRegistry (+18 more)

### Community 26 - ".sendInternal"
Cohesion: 0.12
Nodes (36): activeBottomFrame(), captureBeforeDeadline(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), composerFocusWitnessed(), composerHoldsText(), composerText() (+28 more)

### Community 27 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 29 - "app.ts"
Cohesion: 0.08
Nodes (22): directories, buildApp(), errorStatusCode(), isAppleTouchIconProbe(), ClientPresence, PRESENCE_TTL_MS, transcriptionComputerName(), build() (+14 more)

### Community 30 - "TerminalSessionController"
Cohesion: 0.10
Nodes (6): persistedFormAnswer(), TerminalFormContinuation, TerminalFormReplyError, TerminalSessionController, PendingUserInput, UserInputReplyInput

### Community 31 - "hub-routes.ts"
Cohesion: 0.05
Nodes (40): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+32 more)

### Community 32 - "pwa.ts"
Cohesion: 0.09
Nodes (38): deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate(), retryHubCopilotModels() (+30 more)

### Community 34 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 35 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 36 - "workspace-fixtures.ts"
Cohesion: 0.08
Nodes (30): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, createWorkspaceFixtureState() (+22 more)

### Community 37 - ".clearSerialized"
Cohesion: 0.09
Nodes (6): agentMode(), CopilotClientLike, isMissingSessionError(), removeCopilotSessionFiles(), hasActiveBackgroundTasks(), hasRunningBackgroundAgent()

### Community 38 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 39 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 40 - "background-task-adapter.ts"
Cohesion: 0.12
Nodes (36): addActivity(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), boundedText(), CopilotClientTaskInfo, CopilotClientTaskProgress, CopilotTasksApi, eventTask() (+28 more)

### Community 41 - "transcription-service.ts"
Cohesion: 0.09
Nodes (23): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+15 more)

### Community 42 - "manager-agent.ts"
Cohesion: 0.09
Nodes (23): ManagerEventSource, discover(), isPending(), isQueued(), ManagerAgentOptions, Rung, TURN_ACTIVITY, trusted (+15 more)

### Community 43 - "dependencies"
Cohesion: 0.06
Nodes (35): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/static, @fastify/websocket (+27 more)

### Community 44 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 45 - "session-resource-clear.test.ts"
Cohesion: 0.08
Nodes (27): apps, directories, directory(), obstructUploads(), pairedFixture(), providerFixture(), providers, seed() (+19 more)

### Community 47 - "terminal-session.test.ts"
Cohesion: 0.08
Nodes (29): composerHoldsOtherText(), composerTookPaste(), occurrences(), paneEvidenceCount(), paneShowsText(), parseTerminalUpdateNotice(), pasteCouldCollapse(), pastedPlaceholderCount() (+21 more)

### Community 48 - "agentic-remote"
Cohesion: 0.13
Nodes (31): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+23 more)

### Community 49 - ".handleSessionEvent"
Cohesion: 0.14
Nodes (27): activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength() (+19 more)

### Community 50 - "node-routes.ts"
Cohesion: 0.07
Nodes (28): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile(), configureRuntimeSchema, createSessionSchema (+20 more)

### Community 51 - "SessionKnowledgeStore"
Cohesion: 0.13
Nodes (9): bindingKey(), SessionKnowledgeConflictError, SessionKnowledgeRecoveryError, SessionKnowledgeStore, disk, fixture(), fixtures, releases (+1 more)

### Community 52 - "sessionKey"
Cohesion: 0.11
Nodes (24): SessionKnowledgeBinding, getSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), askSideQuestion(), cancelSelectedBackgroundTask(), closeSideQuestion(), openSideQuestion() (+16 more)

### Community 53 - "manager-agent.test.ts"
Cohesion: 0.09
Nodes (14): ManagerSdkClient, ManagerSdkEvent, ManagerSdkSessionConfig, Behavior, capturePrompt(), computers, fail(), FakeClient (+6 more)

### Community 54 - "session-enqueue-clear.test.ts"
Cohesion: 0.09
Nodes (23): ClaudeSdk, cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle(), deferred() (+15 more)

### Community 55 - "manager-structured-memory.ts"
Cohesion: 0.09
Nodes (25): isMissing(), ManagerStructuredMemoryStoreOptions, openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS, MANAGER_STRUCTURED_MEMORY_MAX_KEY_CHARS (+17 more)

### Community 56 - "SessionOrderStore"
Cohesion: 0.15
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 57 - "manager-store.ts"
Cohesion: 0.14
Nodes (16): JournalRecorder, JournalRecorderOptions, Seen, sessionTask(), JournalDraft, JournalEntry, JournalKind, ManagerRegistry (+8 more)

### Community 58 - "send-matrix.integration.test.ts"
Cohesion: 0.08
Nodes (24): message(), BUSY, CLEAR_REFUSED, client(), dialogs, Draft, drained, exec (+16 more)

### Community 59 - "settings-profile-store.ts"
Cohesion: 0.12
Nodes (15): SettingsProfileState, applySettingsChanges(), applySettingsImport(), isSettingsProfileKey(), sameSettingValue(), SettingsProfileRecord, SettingsRequestError, sizeChecked() (+7 more)

### Community 60 - "session-patch-browser.ts"
Cohesion: 0.14
Nodes (25): advance(), connections, content(), FrameMeasurement, instrument(), lastHeading(), message(), open() (+17 more)

### Community 61 - "KnowledgeStore"
Cohesion: 0.16
Nodes (8): WorkspaceFixtureState, KnowledgeRootReservation, KnowledgeState, KnowledgeStore, directories, fixture(), createHub(), KnowledgeRoot

### Community 62 - "session-reply-durability.test.ts"
Cohesion: 0.13
Nodes (19): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRequest() (+11 more)

### Community 63 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 64 - "ManagerStore"
Cohesion: 0.13
Nodes (4): openStore(), emptyState(), ManagerStore, open()

### Community 65 - "manager-structured-memory-search.ts"
Cohesion: 0.13
Nodes (23): authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord(), ManagerStructuredMemoryFormattedContext (+15 more)

### Community 66 - "src/settings-profile.ts"
Cohesion: 0.11
Nodes (22): AppearanceSetting, isSettingsDeviceId(), isSettingsRevision(), settingsProfileKeys, SettingsProfileValues, Appearance, appearanceFrom(), appearanceStorageKey (+14 more)

### Community 67 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 68 - "active-sessions.ts"
Cohesion: 0.18
Nodes (24): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+16 more)

### Community 69 - "noTmuxServer"
Cohesion: 0.11
Nodes (16): listTmuxSessions(), noTmuxServer(), processGone(), procVisible(), socketIdentity(), directories, { execute }, files (+8 more)

### Community 70 - "SessionResources.tsx"
Cohesion: 0.10
Nodes (19): ManagedSessionSkillsSnapshot, SessionMcpServerSummary, SessionResourceSource, SessionSkillSummary, SessionResourcesDialog(), SessionResourcesView, isSessionResourceCommandName(), sessionResourceCommand() (+11 more)

### Community 71 - "shared/settings-profile.ts"
Cohesion: 0.11
Nodes (24): AccentSetting, appearanceSettings, isRecord(), NewSessionFoldersSetting, NewSessionRuntime, NewSessionRuntimesSetting, oneOf(), oracleResponseStyles (+16 more)

### Community 72 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 73 - "ManagerMessage"
Cohesion: 0.14
Nodes (15): confirmationSchema, defaultsSchema, editSchema, effort, managerInputError(), ManagerRouteAgent, messageParams, registerManagerRoutes() (+7 more)

### Community 74 - "SettingsProfileClient"
Cohesion: 0.21
Nodes (3): errorText(), isRefusal(), SettingsProfileClient

### Community 75 - "ManagerStructuredMemoryStore"
Cohesion: 0.17
Nodes (8): benchmarkState(), now(), openFixture(), searchSamples(), ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryRecoveryError, ManagerStructuredMemoryStore, open()

### Community 76 - "agent-service.test.ts"
Cohesion: 0.13
Nodes (13): terminalFormSteps(), configurableModel(), directories, FakeCopilotClient, probeService(), services, startupFifoFixture(), terminalService() (+5 more)

### Community 77 - ".toolHost"
Cohesion: 0.13
Nodes (4): ManagerHub, hasExplicitStructuredMemoryIntent(), memoryObject, StructuredMemoryMutationOperation

### Community 78 - "session-clear-transcript.test.ts"
Cohesion: 0.11
Nodes (9): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions, disk, fixtures, gate(), holdTurnWrite() (+1 more)

### Community 79 - "session-knowledge-store.ts"
Cohesion: 0.10
Nodes (20): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+12 more)

### Community 80 - "capture-workspace.ts"
Cohesion: 0.20
Nodes (20): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+12 more)

### Community 81 - "use-oracle-settings.ts"
Cohesion: 0.16
Nodes (13): RuntimeModelOption, getManager(), updateManagerSettings(), effortFrom(), efforts, OracleModelSettings(), OracleSettingsStatus(), HarnessProps (+5 more)

### Community 82 - "manager-context.ts"
Cohesion: 0.19
Nodes (16): ago(), attentionRank(), buildTurnContext(), changeLines(), clock(), MANAGER_STRUCTURED_MEMORY_SYSTEM_PROMPT, managerPrompt(), oneLine() (+8 more)

### Community 83 - "submission-error.ts"
Cohesion: 0.15
Nodes (11): directories, runtimes, start(), trusted, RemoteNodeRedirectError, RemoteNodeRequestError, RetainedSessionError, httpDeliveryUncertain() (+3 more)

### Community 84 - "knowledge-tree.ts"
Cohesion: 0.17
Nodes (18): WorkspaceEntry, knowledgeTreeKeyDown(), toggleKnowledgeFolder(), collapseKnowledgeFolder(), expandKnowledgeFolder(), knowledgeAncestors(), KnowledgeCrumb, knowledgeCrumbs() (+10 more)

### Community 85 - "NewSessionDialog"
Cohesion: 0.15
Nodes (21): activateSession(), createSession(), executeCommand(), listDirectories(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), moveSessionToBrowsedFolder() (+13 more)

### Community 86 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 87 - "normalizeKnowledgeRelativePath"
Cohesion: 0.21
Nodes (16): knowledgeFileSchema, joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath(), slashPath(), scopedKnowledgeRoot() (+8 more)

### Community 88 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (9): claude(), clearFixture(), copilot(), disk, event(), fixtures, holdOtherWrite(), releases (+1 more)

### Community 89 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 90 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 91 - "server/side-question.ts"
Cohesion: 0.20
Nodes (10): SIDE_QUESTION_CLEANUP_MS, SIDE_QUESTION_RUNTIME_IDLE_MS, SIDE_QUESTION_TIMEOUT_MS, sideQuestionBoundary(), SideQuestionError, sideQuestionPrompt(), withSideQuestionTimeout(), SIDE_QUESTION_EARLIER_ANSWER_MAX_LENGTH (+2 more)

### Community 92 - "directory-browser.ts"
Cohesion: 0.23
Nodes (11): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin(), SessionDirectoryError (+3 more)

### Community 93 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 94 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 95 - ".correct"
Cohesion: 0.26
Nodes (7): digest(), ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryCorrectInput, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryRememberInput, ManagerStructuredMemoryState

### Community 96 - "refusal-metrics.ts"
Cohesion: 0.16
Nodes (15): countsAsRefusal(), DEFAULT_MAX_REFUSAL_KEYS, httpRefusalReason(), keyId(), notedReasons, overflowId, reasonCodeFromChain(), REFUSAL_OVERFLOW (+7 more)

### Community 97 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 98 - "react"
Cohesion: 0.14
Nodes (8): react, drawDiagram(), drawing, MermaidDiagram(), SessionActions(), recordingDuration(), FakeRecorder, useVoiceRecorder()

### Community 99 - "session-latency-benchmark.ts"
Cohesion: 0.24
Nodes (16): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+8 more)

### Community 100 - "delegated-transcription-service.ts"
Cohesion: 0.17
Nodes (10): collect(), DelegatedTranscriptionOptions, oversized(), statusCodeOf(), hubComputer, workstation, headerSafe(), AudioUpload (+2 more)

### Community 101 - "startup-phases.test.ts"
Cohesion: 0.13
Nodes (11): phases, port, createStartupPhases(), startManagedServer(), StartupPhaseRecord, address, directories, recorder() (+3 more)

### Community 102 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 103 - "background-task-stop.test.ts"
Cohesion: 0.21
Nodes (13): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), snapshot() (+5 more)

### Community 104 - "promotion-monitor.test.ts"
Cohesion: 0.28
Nodes (14): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+6 more)

### Community 105 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 106 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 107 - "SettingsProfileStore"
Cohesion: 0.21
Nodes (5): SettingsProfileStore, directories, store(), SettingsProfileSnapshot, SettingsProfileTransport

### Community 108 - "check-workspace-review-regressions.ts"
Cohesion: 0.14
Nodes (12): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+4 more)

### Community 109 - "terminal-form-deadline.test.ts"
Cohesion: 0.16
Nodes (11): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+3 more)

### Community 110 - "scripts"
Cohesion: 0.14
Nodes (14): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+6 more)

### Community 111 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 112 - "TranscriptionService"
Cohesion: 0.19
Nodes (5): BuildAppOptions, DelegatedTranscriptionService, registerTranscriptionRoutes(), transcriptionMultipartOptions, TranscriptionService

### Community 113 - "registerSessionKnowledgeRoutes"
Cohesion: 0.30
Nodes (11): registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession(), recordReplacement() (+3 more)

### Community 114 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 115 - "BackgroundTasksDialog.tsx"
Cohesion: 0.23
Nodes (10): DialogFrame(), BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive() (+2 more)

### Community 116 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 117 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 118 - "background-task-tracker.ts"
Cohesion: 0.30
Nodes (6): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 119 - "recovery-seed-guards.test.ts"
Cohesion: 0.18
Nodes (8): bootLegacy(), directories, execute, pending, releases, SeedState, services, stores

### Community 120 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 121 - "eventString"
Cohesion: 0.24
Nodes (11): attachmentModeValue(), backgroundHandoff(), booleanValue(), eventString(), lastForegroundCompletionAt(), normalizedToolName(), rawTailText(), shellStopAcknowledged() (+3 more)

### Community 122 - "recordValue"
Cohesion: 0.27
Nodes (11): errorValue(), notificationKind(), parsedValue(), recordValue(), shellIdFromFooter(), shellIdFromValue(), shellTaskOutput(), stringValue() (+3 more)

### Community 123 - "session-knowledge-routes.ts"
Cohesion: 0.18
Nodes (6): Lineage, RegistrationGeneration, ReplacementEvidence, SessionKnowledgeLifecycle, sessionParams, updateSchema

### Community 124 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 126 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 127 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 128 - "KnowledgePosition"
Cohesion: 0.33
Nodes (5): WorkspaceFixtureOptions, KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 129 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 130 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, packageManager, private, type, version

### Community 131 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 132 - "render-workspace-gifs.ts"
Cohesion: 0.29
Nodes (6): directory, { values }, workflows, pnpm, onlyBuiltDependencies, ffmpeg-static

### Community 133 - "history-projection.test.ts"
Cohesion: 0.33
Nodes (5): eventsFor(), ModelMessage, random(), seedOffset, terminalTypes

### Community 134 - "settings-profile-routes.ts"
Cohesion: 0.33
Nodes (6): deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, SETTINGS_DEVICE_ID_MAX_LENGTH

### Community 135 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 136 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 137 - "recovery-context.ts"
Cohesion: 0.47
Nodes (4): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief

### Community 138 - "settings-profile-routes.test.ts"
Cohesion: 0.40
Nodes (5): directories, fakeManager(), hub(), local, profileStore()

### Community 139 - "saveEdit"
Cohesion: 0.40
Nodes (6): editQueuedManagerMessage(), announce(), cancelEdit(), onEditKeyDown(), returnFocusToEdit(), saveEdit()

### Community 140 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 141 - "api-origin.test.ts"
Cohesion: 0.40
Nodes (4): prefixes, session, trusted, untrusted

### Community 143 - "vite.config.ts"
Cohesion: 0.40
Nodes (3): canaryTests, packageVersion, tmuxTests

## Knowledge Gaps
- **895 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+890 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1363 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `.clearSerialized`, `contracts.ts`, `claude-agent-service.ts`, `CopilotSessionLike`, `.discoverTerminalSessions`, `.get`, `.handleSessionEvent`, `server/side-question.ts`, `directory-browser.ts`, `TerminalSessionController`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `ClaudeAgentService` connect `SessionDetail` to `SessionService`, `contracts.ts`, `claude-agent-service.ts`, `session-resource-clear.test.ts`, `CopilotSessionLike`, `use-oracle-settings.ts`, `.get`, `TerminalSessionController`, `directory-browser.ts`, `session-reply-durability.test.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionStore` to `AgentService`, `SessionDetail`, `.clearSerialized`, `contracts.ts`, `.handleSessionEvent`, `.get`, `session-enqueue-clear.test.ts`, `TerminalSessionController`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `App()` (e.g. with `createSettingsProfileClient()` and `prefersLightNow()`) actually correct?**
  _`App()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _895 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.027872825777017395 - nodes in this community are weakly interconnected._
- **Should `SessionStore` be split into smaller, more focused modules?**
  _Cohesion score 0.027482195224130708 - nodes in this community are weakly interconnected._
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
