# Agentic Remote - Graphify code map

Snapshot: `62ddc229708b50e14e1b314ace8b354811d465d06ffbee625fd0c27d90987c7e`

Source checkout: `1a00c162ad2a27955ace017b7bc53d1e1e9e6075`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 314 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 314 files · ~627,745 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 4802 nodes · 13575 edges · 176 communities (143 shown, 17 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 891 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- App
- api.ts
- App.tsx
- SessionStore
- SessionDetail
- terminal-session.ts
- agentic-remote-promotion-monitor
- contracts.ts
- CopilotSessionLike
- claude-agent-service.ts
- PushNotificationService
- ManagerAgent
- TmuxTerminalSessionController
- manager-agent.ts
- manager-tools.ts
- session-presentation.ts
- hub-routes.ts
- session-resource-providers.test.ts
- manager-structured-memory-validation.ts
- ManagedSession
- TerminalSessionController
- UserInputReplyInput
- session-knowledge-store.ts
- SessionService
- RemoteNodeClient
- markdown-navigation.ts
- session-store.ts
- manager-context.ts
- tmux-test-helpers.ts
- session-latency-benchmark.ts
- agent-service.ts
- bundle
- ProviderSessionService
- active-sessions.ts
- pwa.ts
- lib.rs
- shell.ts
- FakeSessionService
- agentic-remote-promotion-setup
- config.rs
- KnowledgeStore
- background-task-adapter.ts
- knowledge-tree.ts
- dependencies
- devDependencies
- app.ts
- node-routes.ts
- manager-structured-memory.ts
- agentic-remote
- session-patch-routes.test.ts
- AgentProvider
- shared/settings-profile.ts
- SessionOrderStore
- terminal-startup-queue.test.ts
- .toolHost
- manager-agent.test.ts
- manager-structured-memory-search.ts
- ManagerStore
- session-patch-browser.ts
- cli-canary.ts
- terminal-session.test.ts
- scripts
- send-matrix.integration.test.ts
- src/settings-profile.ts
- workspace-fixtures.ts
- session-knowledge-routes.ts
- compilerOptions
- react
- .handleSessionEvent
- ManagerStructuredMemoryStore
- transcription-service.ts
- SettingsProfileClient
- capture-workspace.ts
- refusal-metrics.ts
- session-clear-transcript.test.ts
- session-reply-durability.test.ts
- isTerminalComposerFooter
- delegated-transcription-service.test.ts
- use-oracle-settings.ts
- startup-phases.test.ts
- settings-profile-store.ts
- PromptCards.tsx
- ManagerAssistant.tsx
- ManagerAssistant
- compilerOptions
- agent-service.test.ts
- ComputerSummary
- session-store-providers.test.ts
- compilerOptions
- compilerOptions
- directory-browser.ts
- TranscriptionError
- workspace-browser.ts
- SessionKnowledgeBinding
- SettingsProfileSnapshot
- ManagerMemory
- submission-error.ts
- ReaderWorkspace
- server/side-question.ts
- background-task-stop.test.ts
- recovery-resend-durability.test.ts
- server/session-patches.ts
- SessionResources.tsx
- NewSessionDialog
- check-workspace-review-regressions.ts
- terminal-form-deadline.test.ts
- promotion-monitor.test.ts
- capture-workbench-review.ts
- scripts
- desktop.json
- theme-contrast.test.ts
- .oxlintrc.json
- settings-local.json
- FakeCopilotClient
- session-knowledge-routes.test.ts
- background-task-tracker.ts
- manager-structured-memory-performance.test.ts
- BackgroundTasksDialog.tsx
- html-preview.ts
- eventString
- recordValue
- ManagerStructuredMemoryRuntime
- generate-pwa-icons.ts
- file-upload-routes.ts
- session-resource-transport.ts
- bridge.rs
- screenshot-stability.test.ts
- promotion-setup-execution.test.ts
- remote-node-client.test.ts
- tmux-errors.test.ts
- KnowledgePosition
- package.json
- release-publication.test.ts
- render-workspace-gifs.ts
- history-projection.test.ts
- settings-profile-routes.ts
- settings.ts
- toolActivityContent
- composer-layout.test.ts
- usePanelWidth
- hasActiveBackgroundTasks
- removeComputer
- FakeRecorder
- FakeRecorder
- vite.config.ts
- terminal-send-uncertainty.test.ts
- MermaidDiagram.tsx
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

## Communities (176 total, 17 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.04
Nodes (9): agentMode(), AgentService, isMissingSessionError(), removeCopilotSessionFiles(), RuntimeConfigurationError, terminalAnswerRefused(), queueConflict(), isRetainedRefusal() (+1 more)

### Community 1 - "App"
Cohesion: 0.03
Nodes (139): isManagerEvent(), alertNotification(), terminalSendOptions(), askSession(), restartSession(), setSessionNotificationsMuted(), activeComposerPastes(), App() (+131 more)

### Community 2 - "api.ts"
Cohesion: 0.03
Nodes (120): SettingsChange, SettingsProfileKey, SettingsUpdateResult, parseSubmissionReceipt(), submissionReceiptFromError(), addKnowledgeRoot(), bootstrapSessionOrder(), cancelBackgroundTask() (+112 more)

### Community 3 - "App.tsx"
Cohesion: 0.02
Nodes (111): AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph(), activityStatusLabel() (+103 more)

### Community 4 - "SessionStore"
Cohesion: 0.04
Nodes (38): storage(), fixture(), restart(), fixture(), connect(), createStore(), enqueue(), fixture() (+30 more)

### Community 5 - "SessionDetail"
Cohesion: 0.06
Nodes (5): ClaudeAgentService, isMissingClaudeSessionError(), copilotRequest(), QueuedPromptReservation, SessionDetail

### Community 6 - "terminal-session.ts"
Cohesion: 0.06
Nodes (86): activeBottomFrame(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFocusWitnessed(), composerHoldsOtherText() (+78 more)

### Community 7 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (77): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url(), CANARY (+69 more)

### Community 8 - "contracts.ts"
Cohesion: 0.05
Nodes (44): ClaudeAgentServiceEvents, RemoteResync, RemoteSessionRead, DirectoryScope, directories, AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, ProviderSessionServiceEvents (+36 more)

### Community 9 - "CopilotSessionLike"
Cohesion: 0.05
Nodes (36): CopilotSessionLike, CopilotTasksApi, acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight() (+28 more)

### Community 10 - "claude-agent-service.ts"
Cohesion: 0.08
Nodes (52): AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission, PendingClaudeReply (+44 more)

### Community 11 - "PushNotificationService"
Cohesion: 0.06
Nodes (31): WorkspaceFixture, ComputerManagerEvents, brief(), HubEventSource, OracleEventSource, PushNotificationService, PushPolicy, PushSender (+23 more)

### Community 12 - "ManagerAgent"
Cohesion: 0.09
Nodes (13): checkContent(), delay(), discover(), errorMessage(), isNotFound(), ManagerAgent, ManagerSdkSession, sameRuntime() (+5 more)

### Community 13 - "TmuxTerminalSessionController"
Cohesion: 0.08
Nodes (19): startAgentAfterClear(), copilotCommand(), endProbeSession(), execFileAsync, FormReplyDeadlineError, formReplyExpired(), listTmuxSessions(), processAncestors() (+11 more)

### Community 14 - "manager-agent.ts"
Cohesion: 0.06
Nodes (38): CreationRuntime, isPending(), isQueued(), ManagerAgentOptions, Rung, TURN_ACTIVITY, confirmationSchema, defaultsSchema (+30 more)

### Community 15 - "manager-tools.ts"
Cohesion: 0.06
Nodes (31): APPROVE_WORDS, computerField, createManagerTools(), define(), deliver(), requireComputer(), resolveSession(), structuredTools() (+23 more)

### Community 16 - "session-presentation.ts"
Cohesion: 0.07
Nodes (50): saveSessionOrderLane(), handleDragEnd(), KnowledgeRootSelector(), root, reorderSessionLaneWithHiddenFollowers(), SessionFilter, sessionNavigationView, computers (+42 more)

### Community 17 - "hub-routes.ts"
Cohesion: 0.05
Nodes (53): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+45 more)

### Community 18 - "session-resource-providers.test.ts"
Cohesion: 0.05
Nodes (47): ClaudeSdk, cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle(), deferred() (+39 more)

### Community 19 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 20 - "ManagedSession"
Cohesion: 0.14
Nodes (9): ComputerManager, managedSession(), RemoteSessionListing, DelegatedTranscriptionOptions, registerHubRoutes(), AudioTranscription, ManagedRemovedQueuedPrompt, ManagedSession (+1 more)

### Community 21 - "TerminalSessionController"
Cohesion: 0.04
Nodes (26): CopilotClientLike, holdProbe(), fixtures, gate(), releases, directories, fakeClient(), ForkRequest (+18 more)

### Community 22 - "UserInputReplyInput"
Cohesion: 0.08
Nodes (12): foregroundTurnOpen(), isForegroundCompletionEvent(), isForegroundLifecycleEvent(), isUncertainDelivery(), persistedFormAnswer(), statusFromEvents(), TerminalFormContinuation, fixture() (+4 more)

### Community 23 - "session-knowledge-store.ts"
Cohesion: 0.07
Nodes (29): bindingKey(), bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor() (+21 more)

### Community 24 - "SessionService"
Cohesion: 0.07
Nodes (14): registerNodeRoutes(), apps, directories, directory(), obstructUploads(), pairedFixture(), providerFixture(), providers (+6 more)

### Community 25 - "RemoteNodeClient"
Cohesion: 0.06
Nodes (9): headerSafe(), RemoteNodeClient, BackgroundTaskSnapshot, NodeInfo, RemovedQueuedPrompt, WorkspaceFile, WorkspaceListing, KnowledgeFolderState (+1 more)

### Community 26 - "markdown-navigation.ts"
Cohesion: 0.08
Nodes (42): executeCommand(), listWorkspace(), readWorkspaceFile(), searchWorkspace(), moveSessionToBrowsedFolder(), ChangeDirectoryDialog(), browseDirectory(), submit() (+34 more)

### Community 27 - "session-store.ts"
Cohesion: 0.05
Nodes (32): idleDaysSchema, mergeSessionRetention(), sessionRetentionPatchSchema, sessionRetentionSchema, directories, now, activityDuration(), activityResultPreview() (+24 more)

### Community 28 - "manager-context.ts"
Cohesion: 0.09
Nodes (31): ago(), attentionRank(), buildTurnContext(), changeLines(), clock(), MANAGER_STRUCTURED_MEMORY_SYSTEM_PROMPT, MANAGER_SYSTEM_PROMPT, managerPrompt() (+23 more)

### Community 29 - "tmux-test-helpers.ts"
Cohesion: 0.10
Nodes (37): exec, formFixture(), horizontalFormFixture(), textFieldFormFixture(), directories, exec, noTmuxServer(), processGone() (+29 more)

### Community 30 - "session-latency-benchmark.ts"
Cohesion: 0.08
Nodes (30): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+22 more)

### Community 31 - "agent-service.ts"
Cohesion: 0.05
Nodes (40): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), ActivityToolStart, AgentServiceEvents, ansiSequence, commandShortcut() (+32 more)

### Community 32 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 34 - "active-sessions.ts"
Cohesion: 0.10
Nodes (38): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+30 more)

### Community 35 - "pwa.ts"
Cohesion: 0.09
Nodes (38): deletePushSubscription(), getPushPublicKey(), savePushSubscription(), sendTestPushNotification(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate() (+30 more)

### Community 36 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 37 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 38 - "FakeSessionService"
Cohesion: 0.07
Nodes (4): FakeSessionService, routingFixture(), session(), temporaryDirectory()

### Community 39 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 40 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 41 - "KnowledgeStore"
Cohesion: 0.10
Nodes (13): WorkspaceFixtureState, SessionMuteCarrier, KnowledgeRootReservation, KnowledgeState, KnowledgeStore, directories, fixture(), directories (+5 more)

### Community 42 - "background-task-adapter.ts"
Cohesion: 0.12
Nodes (35): addActivity(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), boundedText(), CopilotClientTaskInfo, CopilotClientTaskProgress, eventTask(), executionModeValue() (+27 more)

### Community 43 - "knowledge-tree.ts"
Cohesion: 0.09
Nodes (34): WorkspaceEntry, listKnowledgeEntries(), readKnowledgeFile(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor() (+26 more)

### Community 44 - "dependencies"
Cohesion: 0.06
Nodes (35): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/static, @fastify/websocket (+27 more)

### Community 45 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 46 - "app.ts"
Cohesion: 0.09
Nodes (21): prefixes, session, trusted, untrusted, directories, buildApp(), errorStatusCode(), isAppleTouchIconProbe() (+13 more)

### Community 47 - "node-routes.ts"
Cohesion: 0.06
Nodes (28): ActiveClaudeQuery, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, knowledgeFileQuerySchema (+20 more)

### Community 48 - "manager-structured-memory.ts"
Cohesion: 0.08
Nodes (28): ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryStoreOptions, openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS (+20 more)

### Community 49 - "agentic-remote"
Cohesion: 0.13
Nodes (31): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+23 more)

### Community 50 - "session-patch-routes.test.ts"
Cohesion: 0.09
Nodes (14): managers, releases, remote, ComputerRegistry, RegistryState, directories, remoteSnapshotFixture(), NodeIdentityStore (+6 more)

### Community 51 - "AgentProvider"
Cohesion: 0.08
Nodes (20): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription (+12 more)

### Community 52 - "shared/settings-profile.ts"
Cohesion: 0.10
Nodes (29): AccentSetting, appearanceSettings, applySettingsChanges(), isRecord(), isSettingsRevision(), NewSessionFoldersSetting, NewSessionRuntimesSetting, oneOf() (+21 more)

### Community 53 - "SessionOrderStore"
Cohesion: 0.15
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 54 - "terminal-startup-queue.test.ts"
Cohesion: 0.14
Nodes (25): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+17 more)

### Community 55 - ".toolHost"
Cohesion: 0.10
Nodes (7): ManagerHub, hasExplicitStructuredMemoryIntent(), memoryObject, StructuredMemoryMutationOperation, PermissionReplyInput, RenameSessionInput, SendMessageInput

### Community 56 - "manager-agent.test.ts"
Cohesion: 0.10
Nodes (13): ManagerSdkClient, ManagerSdkEvent, ManagerSdkSessionConfig, Behavior, capturePrompt(), computers, fail(), FakeClient (+5 more)

### Community 57 - "manager-structured-memory-search.ts"
Cohesion: 0.12
Nodes (24): authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord(), ManagerStructuredMemoryFormattedContext (+16 more)

### Community 58 - "ManagerStore"
Cohesion: 0.12
Nodes (4): openStore(), emptyState(), ManagerStore, open()

### Community 59 - "session-patch-browser.ts"
Cohesion: 0.13
Nodes (25): advance(), Connection, connections, content(), FrameMeasurement, lastHeading(), message(), percentile() (+17 more)

### Community 60 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 61 - "terminal-session.test.ts"
Cohesion: 0.10
Nodes (21): parseTerminalUpdateNotice(), bracketedTabPane, clearFixture(), deliveryFixture(), desktopInstallPane, directories, downloadedUpdateFooter, execFileAsync (+13 more)

### Community 62 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 63 - "send-matrix.integration.test.ts"
Cohesion: 0.08
Nodes (22): BUSY, CLEAR_REFUSED, client(), dialogs, Draft, drained, exec, Expected (+14 more)

### Community 64 - "src/settings-profile.ts"
Cohesion: 0.10
Nodes (21): AppearanceSetting, NewSessionRuntime, SETTINGS_MAX_COMPUTERS, settingsProfileKeys, SettingsProfileValues, statuslineItems, Appearance, appearanceFrom() (+13 more)

### Community 65 - "workspace-fixtures.ts"
Cohesion: 0.12
Nodes (19): instrument(), open(), createWorkspaceFixtureState(), documents, FIXTURE_NOW, fixtureBackgroundTasks, fixtureEndpoints, fixtureKnowledgeListings (+11 more)

### Community 66 - "session-knowledge-routes.ts"
Cohesion: 0.13
Nodes (17): Lineage, registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession() (+9 more)

### Community 67 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 68 - "react"
Cohesion: 0.11
Nodes (12): react, transcribeAudio(), DocumentViewControls(), actions, outline, DocumentHeading, MarkdownCodeBlock(), copy() (+4 more)

### Community 69 - ".handleSessionEvent"
Cohesion: 0.21
Nodes (20): activityKind(), activityResult(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), isBackgroundTaskEvent(), isUnsupportedBackgroundTaskError() (+12 more)

### Community 70 - "ManagerStructuredMemoryStore"
Cohesion: 0.24
Nodes (5): digest(), ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryStore, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryState

### Community 71 - "transcription-service.ts"
Cohesion: 0.11
Nodes (19): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+11 more)

### Community 72 - "SettingsProfileClient"
Cohesion: 0.21
Nodes (3): errorText(), isRefusal(), SettingsProfileClient

### Community 73 - "capture-workspace.ts"
Cohesion: 0.19
Nodes (21): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+13 more)

### Community 74 - "refusal-metrics.ts"
Cohesion: 0.15
Nodes (16): countsAsRefusal(), DEFAULT_MAX_REFUSAL_KEYS, httpRefusalReason(), keyId(), notedReasons, noteRefusalReason(), overflowId, reasonCodeFromChain() (+8 more)

### Community 75 - "session-clear-transcript.test.ts"
Cohesion: 0.11
Nodes (9): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions, disk, fixtures, gate(), holdTurnWrite() (+1 more)

### Community 76 - "session-reply-durability.test.ts"
Cohesion: 0.15
Nodes (18): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRunFixture() (+10 more)

### Community 77 - "isTerminalComposerFooter"
Cohesion: 0.13
Nodes (20): boxedComposerFrame(), captureTerminal(), composerFrameText(), composerHasFocus(), composerRowText(), cursorComposerFrame(), DownloadedUpdateCell, downloadedUpdateFooterBlock() (+12 more)

### Community 78 - "delegated-transcription-service.test.ts"
Cohesion: 0.12
Nodes (8): BuildAppOptions, DelegatedTranscriptionService, hubComputer, workstation, registerTranscriptionRoutes(), transcriptionMultipartOptions, MAX_AUDIO_BYTES, TranscriptionService

### Community 79 - "use-oracle-settings.ts"
Cohesion: 0.16
Nodes (13): RuntimeModelOption, getManager(), updateManagerSettings(), effortFrom(), efforts, OracleModelSettings(), OracleSettingsStatus(), HarnessProps (+5 more)

### Community 80 - "startup-phases.test.ts"
Cohesion: 0.12
Nodes (12): phases, port, createStartupPhases(), startManagedServer(), StartupPhaseEvent, StartupPhaseRecord, address, directories (+4 more)

### Community 81 - "settings-profile-store.ts"
Cohesion: 0.18
Nodes (11): profileStore(), SettingsProfileState, SettingsProfileStore, directories, store(), applySettingsImport(), isSettingsDeviceId(), isSettingsProfileKey() (+3 more)

### Community 82 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (19): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+11 more)

### Community 83 - "ManagerAssistant.tsx"
Cohesion: 0.14
Nodes (11): ManagerStatus, removeQueuedManagerMessage(), resolveManagerConfirmation(), retryManagerMessage(), sessionLinkTarget(), OracleButton(), OracleControl, OracleIndicator (+3 more)

### Community 84 - "ManagerAssistant"
Cohesion: 0.14
Nodes (19): editQueuedManagerMessage(), applyEvent(), canTakeFocus(), ManagerAssistant(), act(), announce(), cancelEdit(), onEditKeyDown() (+11 more)

### Community 85 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 86 - "agent-service.test.ts"
Cohesion: 0.12
Nodes (9): terminalFormSteps(), DeferredSession, directories, services, CopilotTaskInfo, CopilotTaskProgress, TerminalCancelOptions, BackgroundTaskKind (+1 more)

### Community 87 - "ComputerSummary"
Cohesion: 0.18
Nodes (7): mapWithConcurrency(), fixture(), session(), sessionAtLeastAsNew(), RegisteredComputer, TurnContextInput, ComputerSummary

### Community 88 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (9): claude(), clearFixture(), copilot(), disk, event(), fixtures, holdOtherWrite(), releases (+1 more)

### Community 89 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 90 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 91 - "directory-browser.ts"
Cohesion: 0.23
Nodes (11): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin(), SessionDirectoryError (+3 more)

### Community 92 - "TranscriptionError"
Cohesion: 0.19
Nodes (8): collect(), oversized(), statusCodeOf(), AudioUpload, LocalTranscriptionService, supportsAudioUpload(), fixture(), TranscriptionError

### Community 93 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 94 - "SessionKnowledgeBinding"
Cohesion: 0.20
Nodes (13): SessionKnowledgeBinding, getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey(), knowledgePositionForBinding() (+5 more)

### Community 95 - "SettingsProfileSnapshot"
Cohesion: 0.17
Nodes (6): SettingsProfileSnapshot, settingsProfileCacheKey, SettingsProfileTransport, cached(), FakeHub, MemoryStorage

### Community 96 - "ManagerMemory"
Cohesion: 0.22
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 97 - "submission-error.ts"
Cohesion: 0.18
Nodes (10): directories, runtimes, start(), trusted, RemoteNodeRedirectError, RemoteNodeRequestError, httpDeliveryUncertain(), legacyDefinitiveHttpRefusals (+2 more)

### Community 98 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 99 - "server/side-question.ts"
Cohesion: 0.20
Nodes (10): SIDE_QUESTION_CLEANUP_MS, SIDE_QUESTION_RUNTIME_IDLE_MS, SIDE_QUESTION_TIMEOUT_MS, sideQuestionBoundary(), SideQuestionError, sideQuestionPrompt(), withSideQuestionTimeout(), SIDE_QUESTION_EARLIER_ANSWER_MAX_LENGTH (+2 more)

### Community 100 - "background-task-stop.test.ts"
Cohesion: 0.21
Nodes (13): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), snapshot() (+5 more)

### Community 101 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 102 - "server/session-patches.ts"
Cohesion: 0.22
Nodes (7): diffMessages(), Publication, sameMessage(), sessionKey(), SessionPublications, SessionUpserted, SessionMessagesPatch

### Community 103 - "SessionResources.tsx"
Cohesion: 0.14
Nodes (12): ManagedSessionMcpServersSnapshot, ManagedSessionSkillsSnapshot, SessionMcpServerSummary, SessionResourceSource, SessionSkillSummary, Catalog, CatalogResult, sourceLabels (+4 more)

### Community 104 - "NewSessionDialog"
Cohesion: 0.20
Nodes (16): activateSession(), createSession(), listDirectories(), listHistory(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), reopenInterruptedSession() (+8 more)

### Community 105 - "check-workspace-review-regressions.ts"
Cohesion: 0.14
Nodes (12): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+4 more)

### Community 106 - "terminal-form-deadline.test.ts"
Cohesion: 0.16
Nodes (11): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+3 more)

### Community 107 - "promotion-monitor.test.ts"
Cohesion: 0.25
Nodes (12): advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture(), installVitest() (+4 more)

### Community 108 - "capture-workbench-review.ts"
Cohesion: 0.15
Nodes (11): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, fixtureSessions (+3 more)

### Community 109 - "scripts"
Cohesion: 0.14
Nodes (14): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+6 more)

### Community 110 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 111 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 112 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 113 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 114 - "FakeCopilotClient"
Cohesion: 0.21
Nodes (5): configurableModel(), FakeCopilotClient, probeService(), startupFifoFixture(), terminalService()

### Community 115 - "session-knowledge-routes.test.ts"
Cohesion: 0.18
Nodes (9): ServerRole, SessionMetadataLookup, disk, FakeManager, fixtures, gate(), holdWrite(), releases (+1 more)

### Community 116 - "background-task-tracker.ts"
Cohesion: 0.30
Nodes (6): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 117 - "manager-structured-memory-performance.test.ts"
Cohesion: 0.23
Nodes (7): benchmarkState(), now(), openFixture(), searchSamples(), isMissing(), ManagerStructuredMemoryRecoveryError, open()

### Community 118 - "BackgroundTasksDialog.tsx"
Cohesion: 0.27
Nodes (9): BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive(), taskStatusLabel() (+1 more)

### Community 119 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 120 - "eventString"
Cohesion: 0.24
Nodes (11): attachmentModeValue(), backgroundHandoff(), booleanValue(), eventString(), lastForegroundCompletionAt(), normalizedToolName(), rawTailText(), shellStopAcknowledged() (+3 more)

### Community 121 - "recordValue"
Cohesion: 0.27
Nodes (11): errorValue(), notificationKind(), parsedValue(), recordValue(), shellIdFromFooter(), shellIdFromValue(), shellTaskOutput(), stringValue() (+3 more)

### Community 122 - "ManagerStructuredMemoryRuntime"
Cohesion: 0.24
Nodes (4): initializeManagerStructuredMemory(), ManagerStructuredMemoryRuntime, ManagerStructuredMemoryMode, ManagerStructuredMemoryStatus

### Community 123 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 124 - "file-upload-routes.ts"
Cohesion: 0.29
Nodes (6): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile()

### Community 125 - "session-resource-transport.ts"
Cohesion: 0.31
Nodes (8): CopilotResourceMethod, readClaudeMcp(), readCopilotResource(), copilotTransport(), disposals, Frame, write(), unavailable()

### Community 126 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 127 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 128 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 129 - "remote-node-client.test.ts"
Cohesion: 0.28
Nodes (5): client(), servers, session, TERMINAL_REQUEST_TIMEOUT_MS, TERMINAL_STARTUP_TIMEOUT_MS

### Community 130 - "tmux-errors.test.ts"
Cohesion: 0.25
Nodes (6): directories, { execute }, files, links, listener(), server()

### Community 131 - "KnowledgePosition"
Cohesion: 0.36
Nodes (4): WorkspaceFixtureOptions, KnowledgePosition, KnowledgeRestoreState, base

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

### Community 136 - "settings-profile-routes.ts"
Cohesion: 0.33
Nodes (6): deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, SETTINGS_DEVICE_ID_MAX_LENGTH

### Community 137 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 138 - "toolActivityContent"
Cohesion: 0.40
Nodes (6): previewText(), readableMcpServerName(), readableToolName(), sameToolLabel(), stripAnsi(), toolActivityContent()

### Community 139 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 140 - "usePanelWidth"
Cohesion: 0.47
Nodes (6): boundWidth(), readWidth(), storeWidth(), usePanelWidth(), commit(), finish()

### Community 142 - "removeComputer"
Cohesion: 0.60
Nodes (5): addComputer(), removeComputer(), ComputersDialog(), remove(), submit()

### Community 145 - "vite.config.ts"
Cohesion: 0.40
Nodes (3): canaryTests, packageVersion, tmuxTests

### Community 148 - "MermaidDiagram.tsx"
Cohesion: 0.67
Nodes (3): drawDiagram(), drawing, MermaidDiagram()

## Knowledge Gaps
- **895 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+890 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1363 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `server/side-question.ts`, `SessionStore`, `.handleSessionEvent`, `contracts.ts`, `CopilotSessionLike`, `directory-browser.ts`, `claude-agent-service.ts`, `background-task-adapter.ts`, `AgentProvider`, `TerminalSessionController`, `UserInputReplyInput`, `session-store.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `buildApp()` connect `app.ts` to `AgentService`, `SessionStore`, `SessionDetail`, `PushNotificationService`, `ManagerAgent`, `manager-agent.ts`, `ManagedSession`, `UserInputReplyInput`, `session-knowledge-store.ts`, `SessionService`, `manager-context.ts`, `ProviderSessionService`, `KnowledgeStore`, `session-patch-routes.test.ts`, `SessionOrderStore`, `ManagerStore`, `cli-canary.ts`, `transcription-service.ts`, `refusal-metrics.ts`, `delegated-transcription-service.test.ts`, `settings-profile-store.ts`, `TranscriptionError`, `ManagerStructuredMemoryRuntime`, `file-upload-routes.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `App()` connect `App` to `api.ts`, `pwa.ts`, `react`, `App.tsx`, `shell.ts`, `NewSessionDialog`, `PushNotificationService`, `knowledge-tree.ts`, `hasActiveBackgroundTasks`, `session-presentation.ts`, `hub-routes.ts`, `UserInputReplyInput`, `SessionKnowledgeBinding`, `markdown-navigation.ts`, `session-latency-benchmark.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `App()` (e.g. with `createSettingsProfileClient()` and `prefersLightNow()`) actually correct?**
  _`App()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _895 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.04010146804835924 - nodes in this community are weakly interconnected._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.034657106085677514 - nodes in this community are weakly interconnected._
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
