# Agentic Remote - Graphify code map

Snapshot: `b0ea8a500685a3b01bb22e07b7f2dea50a58b44836a145d77c244197269c4f40`

Source checkout: `991ce935f883c5ac91f48ad31ce2ee6e0bff4127`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 311 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 311 files · ~623,385 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 4751 nodes · 13452 edges · 178 communities (138 shown, 22 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 885 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App
- AgentService
- contracts.ts
- App.tsx
- SessionDetail
- App.test.tsx
- ClaudeAgentService
- .create
- .sendAdmittedWithBackend
- session-knowledge-store.ts
- agentic-remote-promotion-monitor
- markdown-navigation.ts
- session-store.ts
- PushNotificationService
- CopilotSessionLike
- terminal-session.ts
- sessionKey
- terminal-startup-queue.test.ts
- TmuxTerminalSessionController
- manager-structured-memory-validation.ts
- manager-tools.ts
- hub-routes.ts
- ManagerAgent
- agent-service.ts
- workspace-fixtures.ts
- registerHubRoutes
- ManagerStore
- manager.ts
- pwa.ts
- FakeSessionService
- ProviderSessionService
- bundle
- session-knowledge-routes.test.ts
- SessionService
- .sendInternal
- app.ts
- lib.rs
- workspace-browser.ts
- shell.ts
- agentic-remote-promotion-setup
- config.rs
- .discoverSessions
- manager-agent.ts
- manager-structured-memory.ts
- terminal-session.test.ts
- devDependencies
- active-sessions.ts
- agentic-remote
- session-resources.ts
- manager-agent.test.ts
- dependencies
- node-routes.ts
- ManagerStructuredMemoryStore
- SessionOrderStore
- ManagerAssistant.tsx
- delegated-transcription-service.ts
- settings-profile-store.ts
- .handleSessionEvent
- RemoteNodeClient
- shared/settings-profile.ts
- src/settings-profile.ts
- session-patch-browser.ts
- HubEvent
- background-task-adapter.ts
- cli-canary.ts
- ManagedSession
- scripts
- SettingsProfileClient
- manager-structured-memory-search.ts
- transcription-service.ts
- compilerOptions
- agent-service.test.ts
- ComputerSummary
- capture-workspace.ts
- startup-phases.test.ts
- session-clear-transcript.test.ts
- session-store-providers.test.ts
- api.test.ts
- ManagerAssistant
- use-oracle-settings.ts
- terminal-form-deadline.test.ts
- compilerOptions
- session-reply-durability.test.ts
- compilerOptions
- compilerOptions
- server/side-question.ts
- directory-browser.ts
- recordValue
- event-log.ts
- ManagerMemory
- refusal-metrics.ts
- react
- SessionSkillsSnapshot
- NodeIdentityStore
- NewSessionDialog
- backgroundTasksFromEvents
- use-session-knowledge-root.ts
- ReaderWorkspace
- session-latency-benchmark.ts
- recovery-resend-durability.test.ts
- server/session-patches.ts
- session-resource-routes.test.ts
- background-task-stop.test.ts
- BackgroundTasksDialog.tsx
- desktop.json
- SessionMcpServersSnapshot
- theme-contrast.test.ts
- .oxlintrc.json
- settings-local.json
- .readResources
- promotion-monitor.test.ts
- session-resource-clear.test.ts
- TranscriptionError
- scripts
- background-task-tracker.ts
- claude-agent-service.ts
- recovery-seed-guards.test.ts
- html-preview.ts
- settings-profile.test.ts
- generate-pwa-icons.ts
- DeferredSession
- ManagerStructuredMemoryRuntime
- session-resource-transport.ts
- bridge.rs
- screenshot-stability.test.ts
- KnowledgePosition
- manager-structured-memory-performance.test.ts
- promotion-setup-execution.test.ts
- remote-node-client.test.ts
- tmux-errors.test.ts
- deleteSession
- package.json
- release-publication.test.ts
- render-workspace-gifs.ts
- history-projection.test.ts
- recovery-context.ts
- settings-profile-routes.ts
- settings.ts
- .transport
- composer-layout.test.ts
- ManagerEvent
- MarkdownCodeBlock.tsx
- FakeRecorder
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
- .transcribe
- agentic-remote-shell

## God Nodes (most connected - your core abstractions)
1. `SessionDetail` - 299 edges
2. `App()` - 268 edges
3. `AgentService` - 259 edges
4. `SessionStore` - 176 edges
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
- `BackgroundTaskUpdate` --references--> `BackgroundTaskSnapshot`  [EXTRACTED]
  server/background-task-tracker.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (178 total, 22 thin omitted)

### Community 0 - "App"
Cohesion: 0.03
Nodes (158): isManagerEvent(), askSession(), getSession(), listKnowledgeEntries(), readKnowledgeFile(), replyPermission(), saveSessionVisibility(), transcribeAudio() (+150 more)

### Community 1 - "AgentService"
Cohesion: 0.04
Nodes (11): storage(), agentMode(), AgentService, isMissingSessionError(), removeCopilotSessionFiles(), RuntimeConfigurationError, preparePrompt(), queueConflict() (+3 more)

### Community 2 - "contracts.ts"
Cohesion: 0.04
Nodes (90): managers, releases, remote, RegisteredComputer, RegistryState, DirectoryScope, directories, StoredNodeIdentity (+82 more)

### Community 3 - "App.tsx"
Cohesion: 0.03
Nodes (105): ActivityStatus, configureRuntime(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage() (+97 more)

### Community 4 - "SessionDetail"
Cohesion: 0.05
Nodes (12): isMissingClaudeSessionError(), fixture(), observe(), canArchiveSession(), assertSessionNotRetained(), clearRecoverySeedFailure(), grantTerminalRecovery(), ownsRecoverySeedFailure() (+4 more)

### Community 5 - "App.test.tsx"
Cohesion: 0.03
Nodes (74): addKnowledgeRoot(), bootstrapSessionOrder(), cancelBackgroundTask(), cancelSession(), clearConversation(), configureRetention(), dispatchQueuedPrompt(), executeCommand() (+66 more)

### Community 6 - "ClaudeAgentService"
Cohesion: 0.05
Nodes (24): ClaudeAgentService, ClaudeSdk, cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle() (+16 more)

### Community 7 - ".create"
Cohesion: 0.04
Nodes (57): CopilotClientLike, fixture(), holdProbe(), fixtures, gate(), releases, restart(), directories (+49 more)

### Community 8 - ".sendAdmittedWithBackend"
Cohesion: 0.06
Nodes (6): isUncertainDelivery(), persistedFormAnswer(), terminalAnswerRefused(), TerminalSessionController, UserInputReplyInput, deliveryUncertaintyFromError()

### Community 9 - "session-knowledge-store.ts"
Cohesion: 0.05
Nodes (45): Lineage, registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession() (+37 more)

### Community 10 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (71): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+63 more)

### Community 11 - "markdown-navigation.ts"
Cohesion: 0.05
Nodes (56): UserInputField, UserInputFieldValue, followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), MarkdownImage(), missingDocumentFragment(), WorkspaceDialog() (+48 more)

### Community 12 - "session-store.ts"
Cohesion: 0.04
Nodes (45): boots, [directory, backend, resultPath, phase = 'idle'], fixtureRoot, channels, directories, idleDaysSchema, mergeSessionRetention(), sessionRetentionPatchSchema (+37 more)

### Community 13 - "PushNotificationService"
Cohesion: 0.07
Nodes (29): brief(), HubEventSource, OracleEventSource, PushNotificationService, PushPolicy, PushSender, PushState, directories (+21 more)

### Community 14 - "CopilotSessionLike"
Cohesion: 0.05
Nodes (34): CopilotSessionLike, CopilotTasksApi, acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight() (+26 more)

### Community 15 - "terminal-session.ts"
Cohesion: 0.05
Nodes (61): boxedComposerFrame(), captureTerminal(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFocusWitnessed(), composerFrameText(), composerHasFocus(), composerRowText() (+53 more)

### Community 16 - "sessionKey"
Cohesion: 0.07
Nodes (55): SessionExecutionMode, saveSessionOrderLane(), handleDragEnd(), RenameSessionDialog(), KnowledgeRootSelector(), root, reorderSessionLaneWithHiddenFollowers(), SessionFilter (+47 more)

### Community 17 - "terminal-startup-queue.test.ts"
Cohesion: 0.07
Nodes (49): directories, execFileAsync, processExists(), procStatReads, tmuxSessions, waitForProcessExit(), exec, formFixture() (+41 more)

### Community 18 - "TmuxTerminalSessionController"
Cohesion: 0.09
Nodes (22): copilotCommand(), endProbeSession(), execFileAsync, FormReplyDeadlineError, hasClippedTerminalFormTabs(), listTmuxSessions(), parseTerminalFormActiveField(), processAncestors() (+14 more)

### Community 19 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (52): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+44 more)

### Community 20 - "manager-tools.ts"
Cohesion: 0.07
Nodes (30): APPROVE_WORDS, computerField, createManagerTools(), define(), deliver(), requireComputer(), resolveSession(), structuredTools() (+22 more)

### Community 21 - "hub-routes.ts"
Cohesion: 0.06
Nodes (52): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+44 more)

### Community 22 - "ManagerAgent"
Cohesion: 0.10
Nodes (12): checkContent(), delay(), discover(), errorMessage(), isNotFound(), ManagerAgent, TurnError, withTimeout() (+4 more)

### Community 23 - "agent-service.ts"
Cohesion: 0.04
Nodes (49): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), AgentServiceEvents, ansiSequence, commandShortcut(), CreationRuntime (+41 more)

### Community 24 - "workspace-fixtures.ts"
Cohesion: 0.06
Nodes (40): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, accents (+32 more)

### Community 25 - "registerHubRoutes"
Cohesion: 0.15
Nodes (5): ComputerManager, managedSession(), mapWithConcurrency(), sessionAtLeastAsNew(), registerHubRoutes()

### Community 26 - "ManagerStore"
Cohesion: 0.08
Nodes (15): openStore(), JournalRecorder, JournalRecorderOptions, Seen, sessionTask(), emptyState(), JournalDraft, JournalKind (+7 more)

### Community 27 - "manager.ts"
Cohesion: 0.07
Nodes (30): ManagerAgentOptions, sameRuntime(), confirmationSchema, defaultsSchema, editSchema, effort, managerInputError(), ManagerRouteAgent (+22 more)

### Community 28 - "pwa.ts"
Cohesion: 0.08
Nodes (43): directories, AppVersion, parseAppVersion(), deletePushSubscription(), getProviderRuntimeOptions(), getPushPublicKey(), savePushSubscription(), sendTestPushNotification() (+35 more)

### Community 29 - "FakeSessionService"
Cohesion: 0.06
Nodes (5): FakeSessionService, routingFixture(), session(), temporaryDirectory(), AgentMode

### Community 31 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 32 - "session-knowledge-routes.test.ts"
Cohesion: 0.09
Nodes (17): WorkspaceFixtureState, ServerRole, SessionMetadataLookup, SessionMuteCarrier, KnowledgeRootReservation, KnowledgeState, KnowledgeStore, directories (+9 more)

### Community 34 - ".sendInternal"
Cohesion: 0.13
Nodes (31): activeBottomFrame(), captureBeforeDeadline(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), composerHoldsText(), composerText(), containsCopiedInteractiveFrame() (+23 more)

### Community 35 - "app.ts"
Cohesion: 0.08
Nodes (26): prefixes, session, trusted, untrusted, buildApp(), BuildAppOptions, errorStatusCode(), isAppleTouchIconProbe() (+18 more)

### Community 36 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 37 - "workspace-browser.ts"
Cohesion: 0.09
Nodes (33): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+25 more)

### Community 38 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 39 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 40 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 41 - ".discoverSessions"
Cohesion: 0.10
Nodes (5): httpBoundary(), DiscoveredSession, StartupPhases, hasActiveBackgroundTasks(), hasRunningBackgroundAgent()

### Community 42 - "manager-agent.ts"
Cohesion: 0.10
Nodes (28): isPending(), isQueued(), Rung, TURN_ACTIVITY, ago(), attentionRank(), buildTurnContext(), changeLines() (+20 more)

### Community 43 - "manager-structured-memory.ts"
Cohesion: 0.07
Nodes (30): ManagerStructuredMemorySearchIndex, ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryStoreOptions, openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES (+22 more)

### Community 44 - "terminal-session.test.ts"
Cohesion: 0.08
Nodes (30): composerHoldsOtherText(), composerTookPaste(), occurrences(), paneEvidenceCount(), paneShowsText(), parseTerminalUpdateNotice(), pasteCouldCollapse(), pastedPlaceholderCount() (+22 more)

### Community 45 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 46 - "active-sessions.ts"
Cohesion: 0.12
Nodes (32): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+24 more)

### Community 47 - "agentic-remote"
Cohesion: 0.13
Nodes (31): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+23 more)

### Community 48 - "session-resources.ts"
Cohesion: 0.17
Nodes (30): claudeMcp(), claudeSkillNames(), copilotMcp, copilotSkills, copilotWorkspaceMcp, CopilotWorkspaceSkills, count(), enrichClaudeSkills() (+22 more)

### Community 49 - "manager-agent.test.ts"
Cohesion: 0.08
Nodes (14): ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig, Behavior, capturePrompt(), computers, fail() (+6 more)

### Community 50 - "dependencies"
Cohesion: 0.06
Nodes (33): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, @fastify/multipart, @fastify/static, @fastify/websocket, lucide-react (+25 more)

### Community 51 - "node-routes.ts"
Cohesion: 0.07
Nodes (28): MAX_SESSION_FILE_BYTES, SessionParams, supportedExtensions, supportsSessionFile(), AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, configureRuntimeSchema, createSessionSchema (+20 more)

### Community 52 - "ManagerStructuredMemoryStore"
Cohesion: 0.18
Nodes (8): digest(), isMissing(), ManagerStructuredMemoryRecoveryError, ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryStore, open(), ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryState

### Community 53 - "SessionOrderStore"
Cohesion: 0.15
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 54 - "ManagerAssistant.tsx"
Cohesion: 0.11
Nodes (20): cancelManager(), editQueuedManagerMessage(), removeQueuedManagerMessage(), resetManager(), resolveManagerConfirmation(), retryManagerMessage(), sendManagerMessage(), sessionLinkTarget() (+12 more)

### Community 55 - "delegated-transcription-service.ts"
Cohesion: 0.11
Nodes (12): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, registerTranscriptionRoutes() (+4 more)

### Community 56 - "settings-profile-store.ts"
Cohesion: 0.13
Nodes (18): directories, fakeManager(), hub(), local, profileStore(), SettingsProfileState, SettingsProfileStore, directories (+10 more)

### Community 57 - ".handleSessionEvent"
Cohesion: 0.19
Nodes (20): activityKind(), activityResult(), ActivityToolStart, contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), isBackgroundTaskEvent() (+12 more)

### Community 58 - "RemoteNodeClient"
Cohesion: 0.07
Nodes (3): RemoteResync, RemoteSessionRead, RemoteNodeClient

### Community 59 - "shared/settings-profile.ts"
Cohesion: 0.11
Nodes (26): AccentSetting, appearanceSettings, isRecord(), isSettingsRevision(), NewSessionFoldersSetting, NewSessionRuntimesSetting, oneOf(), oracleResponseStyles (+18 more)

### Community 60 - "src/settings-profile.ts"
Cohesion: 0.10
Nodes (23): AppearanceSetting, NewSessionRuntime, SETTINGS_MAX_COMPUTERS, SettingsChange, SettingsProfileKey, settingsProfileKeys, SettingsProfileValues, statuslineItems (+15 more)

### Community 61 - "session-patch-browser.ts"
Cohesion: 0.14
Nodes (25): advance(), connections, content(), FrameMeasurement, instrument(), lastHeading(), message(), open() (+17 more)

### Community 62 - "HubEvent"
Cohesion: 0.13
Nodes (14): Connection, WorkspaceFixture, ComputerManagerEvents, Client, PatchSocket, Browser, seedOffset, StoredSession (+6 more)

### Community 63 - "background-task-adapter.ts"
Cohesion: 0.10
Nodes (24): BackgroundTaskEventOptions, CopilotClientTaskInfo, CopilotClientTaskProgress, CopilotTaskInfo, CopilotTaskProgress, isBackgroundTaskInfo(), isBackgroundTaskProgress(), isLiveTaskStatus() (+16 more)

### Community 64 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 65 - "ManagedSession"
Cohesion: 0.13
Nodes (5): RemoteSessionListing, ManagerHub, SessionKnowledgeLifecycle, ManagedSession, SessionListing

### Community 66 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 67 - "SettingsProfileClient"
Cohesion: 0.19
Nodes (5): sameSettingValue(), errorText(), isRefusal(), samePending(), SettingsProfileClient

### Community 68 - "manager-structured-memory-search.ts"
Cohesion: 0.15
Nodes (21): authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord(), ManagerStructuredMemoryFormattedContext (+13 more)

### Community 69 - "transcription-service.ts"
Cohesion: 0.10
Nodes (20): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+12 more)

### Community 70 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 71 - "agent-service.test.ts"
Cohesion: 0.12
Nodes (14): foregroundTurnOpen(), isForegroundCompletionEvent(), isForegroundLifecycleEvent(), statusFromEvents(), terminalFormSteps(), configurableModel(), directories, FakeCopilotClient (+6 more)

### Community 72 - "ComputerSummary"
Cohesion: 0.13
Nodes (9): fixture(), session(), apps, directories, FakeManager, fixture(), trusted, createHub() (+1 more)

### Community 73 - "capture-workspace.ts"
Cohesion: 0.19
Nodes (21): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+13 more)

### Community 74 - "startup-phases.test.ts"
Cohesion: 0.12
Nodes (13): phases, port, createStartupPhases(), silentStartupPhases, startManagedServer(), StartupPhaseEvent, StartupPhaseRecord, address (+5 more)

### Community 75 - "session-clear-transcript.test.ts"
Cohesion: 0.11
Nodes (9): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions, disk, fixtures, gate(), holdTurnWrite() (+1 more)

### Community 76 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (11): claude(), clearFixture(), copilot(), disk, event(), fixture(), fixtures, holdOtherWrite() (+3 more)

### Community 77 - "api.test.ts"
Cohesion: 0.16
Nodes (19): fetchSettingsProfile(), HUB_SNAPSHOT_TIMEOUT_MS, importSettingsProfile(), saveSettingsChanges(), sendMessage(), failWith(), browserStorage(), createSettingsProfileClient() (+11 more)

### Community 78 - "ManagerAssistant"
Cohesion: 0.14
Nodes (19): phoneEnterCreatesNewline(), applyEvent(), canTakeFocus(), ManagerAssistant(), act(), announce(), cancelEdit(), onEditKeyDown() (+11 more)

### Community 79 - "use-oracle-settings.ts"
Cohesion: 0.16
Nodes (13): RuntimeModelOption, getManager(), updateManagerSettings(), effortFrom(), efforts, OracleModelSettings(), OracleSettingsStatus(), HarnessProps (+5 more)

### Community 80 - "terminal-form-deadline.test.ts"
Cohesion: 0.12
Nodes (15): TerminalFormContinuation, question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture() (+7 more)

### Community 81 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 82 - "session-reply-durability.test.ts"
Cohesion: 0.16
Nodes (16): assistantFixture(), claudeFixture(), claudeQuestions(), claudeRunFixture(), copilotFixture(), copilotRunFixture(), disk, emptyComposer (+8 more)

### Community 83 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 84 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 85 - "server/side-question.ts"
Cohesion: 0.20
Nodes (10): SIDE_QUESTION_CLEANUP_MS, SIDE_QUESTION_RUNTIME_IDLE_MS, SIDE_QUESTION_TIMEOUT_MS, sideQuestionBoundary(), SideQuestionError, sideQuestionPrompt(), withSideQuestionTimeout(), SIDE_QUESTION_EARLIER_ANSWER_MAX_LENGTH (+2 more)

### Community 86 - "directory-browser.ts"
Cohesion: 0.23
Nodes (11): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin(), SessionDirectoryError (+3 more)

### Community 87 - "recordValue"
Cohesion: 0.18
Nodes (19): attachmentModeValue(), backgroundHandoff(), booleanValue(), eventString(), lastForegroundCompletionAt(), normalizedToolName(), notificationKind(), parsedValue() (+11 more)

### Community 88 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 89 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 90 - "refusal-metrics.ts"
Cohesion: 0.16
Nodes (15): countsAsRefusal(), DEFAULT_MAX_REFUSAL_KEYS, httpRefusalReason(), keyId(), notedReasons, overflowId, reasonCodeFromChain(), REFUSAL_OVERFLOW (+7 more)

### Community 91 - "react"
Cohesion: 0.14
Nodes (8): react, drawDiagram(), drawing, MermaidDiagram(), SessionActions(), recordingDuration(), FakeRecorder, useVoiceRecorder()

### Community 92 - "SessionSkillsSnapshot"
Cohesion: 0.16
Nodes (8): ClaudeResources, releases, session, snapshot, readSessionSkills(), sanitizeSkillsSnapshot(), unavailableSkills(), SessionSkillsSnapshot

### Community 93 - "NodeIdentityStore"
Cohesion: 0.18
Nodes (4): ComputerRegistry, directories, remoteSnapshotFixture(), NodeIdentityStore

### Community 94 - "NewSessionDialog"
Cohesion: 0.17
Nodes (18): provider(), activateSession(), createSession(), listDirectories(), listHistory(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse() (+10 more)

### Community 95 - "backgroundTasksFromEvents"
Cohesion: 0.27
Nodes (17): addActivity(), backgroundTasksFromEvents(), boundedText(), errorValue(), eventTask(), executionModeValue(), isTerminalTaskStatus(), mergeShellRefresh() (+9 more)

### Community 96 - "use-session-knowledge-root.ts"
Cohesion: 0.21
Nodes (12): getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey(), knowledgePositionForBinding(), SessionIdentity (+4 more)

### Community 97 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 98 - "session-latency-benchmark.ts"
Cohesion: 0.23
Nodes (15): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+7 more)

### Community 99 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 100 - "server/session-patches.ts"
Cohesion: 0.22
Nodes (7): diffMessages(), Publication, sameMessage(), sessionKey(), SessionPublications, SessionUpserted, SessionMessagesPatch

### Community 101 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 102 - "background-task-stop.test.ts"
Cohesion: 0.23
Nodes (12): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), started() (+4 more)

### Community 104 - "BackgroundTasksDialog.tsx"
Cohesion: 0.22
Nodes (11): BackgroundTask, DialogFrame(), BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel() (+3 more)

### Community 105 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 106 - "SessionMcpServersSnapshot"
Cohesion: 0.22
Nodes (5): isResourceMethodUnavailable(), readSessionMcpServers(), unavailableMcp(), SessionMcpServersSnapshot, SessionResourceSnapshot

### Community 107 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 108 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 109 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 110 - ".readResources"
Cohesion: 0.24
Nodes (7): ActiveClaudeQuery, readServiceResources(), ResourceRead, ResourceReads, resourceRequestHandler(), safeResourceError(), sameResourceOwner()

### Community 111 - "promotion-monitor.test.ts"
Cohesion: 0.27
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 112 - "session-resource-clear.test.ts"
Cohesion: 0.21
Nodes (12): apps, directories, directory(), obstructUploads(), pairedFixture(), providerFixture(), providers, seed() (+4 more)

### Community 113 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 114 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+4 more)

### Community 115 - "background-task-tracker.ts"
Cohesion: 0.27
Nodes (6): snapshot(), backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint()

### Community 116 - "claude-agent-service.ts"
Cohesion: 0.17
Nodes (11): AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission, PendingClaudeReply (+3 more)

### Community 117 - "recovery-seed-guards.test.ts"
Cohesion: 0.18
Nodes (8): bootLegacy(), directories, execute, pending, releases, SeedState, services, stores

### Community 118 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 119 - "settings-profile.test.ts"
Cohesion: 0.18
Nodes (5): resolveAppearance(), settingsProfileCacheKey, SettingsProfileTransport, cached(), MemoryStorage

### Community 120 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 122 - "ManagerStructuredMemoryRuntime"
Cohesion: 0.27
Nodes (4): initializeManagerStructuredMemory(), ManagerStructuredMemoryRuntime, ManagerStructuredMemoryMode, ManagerStructuredMemoryStatus

### Community 123 - "session-resource-transport.ts"
Cohesion: 0.31
Nodes (8): CopilotResourceMethod, readClaudeMcp(), readCopilotResource(), copilotTransport(), disposals, Frame, write(), unavailable()

### Community 124 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 125 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 126 - "KnowledgePosition"
Cohesion: 0.33
Nodes (5): WorkspaceFixtureOptions, KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 127 - "manager-structured-memory-performance.test.ts"
Cohesion: 0.31
Nodes (6): benchmarkState(), now(), openFixture(), searchSamples(), ManagerStructuredMemorySearchResult, submitSearch()

### Community 128 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 129 - "remote-node-client.test.ts"
Cohesion: 0.28
Nodes (5): client(), servers, session, TERMINAL_REQUEST_TIMEOUT_MS, TERMINAL_STARTUP_TIMEOUT_MS

### Community 130 - "tmux-errors.test.ts"
Cohesion: 0.25
Nodes (6): directories, { execute }, files, links, listener(), server()

### Community 131 - "deleteSession"
Cohesion: 0.28
Nodes (9): addComputer(), deleteKnowledgeRoot(), deleteSession(), removeComputer(), requestVoid(), removeRoot(), ComputersDialog(), remove() (+1 more)

### Community 132 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, packageManager, private, type, version

### Community 133 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 134 - "render-workspace-gifs.ts"
Cohesion: 0.29
Nodes (6): directory, { values }, workflows, pnpm, onlyBuiltDependencies, ffmpeg-static

### Community 135 - "history-projection.test.ts"
Cohesion: 0.33
Nodes (5): eventsFor(), ModelMessage, random(), seedOffset, terminalTypes

### Community 136 - "recovery-context.ts"
Cohesion: 0.38
Nodes (4): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief

### Community 137 - "settings-profile-routes.ts"
Cohesion: 0.33
Nodes (6): deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, SETTINGS_DEVICE_ID_MAX_LENGTH

### Community 138 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 140 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 141 - "ManagerEvent"
Cohesion: 0.40
Nodes (3): ManagerEventSource, trusted, ManagerEvent

### Community 142 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

## Knowledge Gaps
- **865 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+860 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1331 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **22 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `contracts.ts`, `ClaudeAgentService`, `agent-service.test.ts`, `.sendAdmittedWithBackend`, `.discoverSessions`, `SessionMcpServersSnapshot`, `CopilotSessionLike`, `server/side-question.ts`, `directory-browser.ts`, `.handleSessionEvent`, `SessionSkillsSnapshot`, `background-task-adapter.ts`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionDetail` to `AgentService`, `ClaudeAgentService`, `.create`, `.sendAdmittedWithBackend`, `.discoverSessions`, `SessionMcpServersSnapshot`, `session-store.ts`, `.handleSessionEvent`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `fixture()` connect `.create` to `AgentService`, `SessionDetail`, `session-store.ts`, `active-sessions.ts`, `terminal-startup-queue.test.ts`, `TmuxTerminalSessionController`, `event-log.ts`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `App()` (e.g. with `createSettingsProfileClient()` and `prefersLightNow()`) actually correct?**
  _`App()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _865 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.02864151215641007 - nodes in this community are weakly interconnected._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.043842585665120455 - nodes in this community are weakly interconnected._
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
