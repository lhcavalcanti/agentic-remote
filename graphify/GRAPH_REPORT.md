# Agentic Remote - Graphify code map

Snapshot: `bb5462c8cec91d6f805ba624af4a8501548863729c42f36bbebc147d0bbb940f`

Source checkout: `c43bf7b61e94ca10d406da03b04234835cdadb7d`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 339 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 339 files · ~673,252 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 5149 nodes · 14452 edges · 181 communities (145 shown, 20 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 896 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- App.tsx
- App
- api.ts
- SessionDetail
- ClaudeAgentService
- background-task-adapter.ts
- terminal-session.ts
- CopilotSessionLike
- multi-node.test.ts
- session-store.ts
- RemoteNodeClient
- agentic-remote-promotion-monitor
- ManagedSession
- claude-agent-service.ts
- ManagerAgent
- PushNotificationService
- transcription-service.ts
- active-sessions.ts
- session-presentation.ts
- manager-tools.ts
- manager-structured-memory-validation.ts
- contracts.ts
- TmuxTerminalSessionController
- markdown-navigation.ts
- agent-service.ts
- SessionService
- session-knowledge-store.ts
- session-enqueue-clear.test.ts
- ManagerStore
- app.ts
- session-knowledge-routes.test.ts
- bundle
- hub-routes.ts
- terminal-startup-queue.test.ts
- ProviderSessionService
- DreamerStore
- pwa.ts
- shell.ts
- lib.rs
- workspace-fixtures.ts
- agentic-remote-promotion-setup
- terminal-session.test.ts
- agentic-remote-gate
- config.rs
- knowledge-tree.ts
- .sendAdmittedWithBackend
- dependencies
- devDependencies
- manager-agent.ts
- agentic-remote
- manager-structured-memory.ts
- node-routes.ts
- normalizeKnowledgeRelativePath
- dreamer-planner.ts
- manager-agent.test.ts
- SessionOrderStore
- OracleDreamer.tsx
- DreamerService
- settings-profile-store.ts
- shared/settings-profile.ts
- startup-phases.test.ts
- session-patch-browser.ts
- UserInputReplyInput
- agent-service.test.ts
- cli-canary.ts
- dreamer-store.ts
- send-matrix.integration.test.ts
- session-resource-clear.test.ts
- scripts
- dreamer-service.ts
- manager-structured-memory-search.ts
- SettingsProfileClient
- KnowledgeStore
- recordValue
- src/settings-profile.ts
- compilerOptions
- manager-context.ts
- ManagerStructuredMemoryStore
- refusal-metrics.ts
- HubEvent
- manager-routes.ts
- .sendInternal
- capture-workspace.ts
- full-gate.test.ts
- PromptCards.tsx
- ManagerAssistant
- compilerOptions
- .toolHost
- session-reply-durability.test.ts
- session-store-providers.test.ts
- compilerOptions
- compilerOptions
- server/side-question.ts
- directory-browser.ts
- event-log.ts
- ManagerMemory
- workspace-browser.ts
- SettingsProfileSnapshot
- use-oracle-settings.ts
- dreamer-schedule.ts
- ReaderWorkspace
- use-session-knowledge-root.ts
- terminal-form-deadline.test.ts
- session-latency-benchmark.ts
- SessionStatus
- promotion-monitor.test.ts
- recovery-resend-durability.test.ts
- server/session-patches.ts
- session-resource-routes.test.ts
- NewSessionDialog
- ManagerAssistant.test.tsx
- check-workspace-review-regressions.ts
- scripts
- desktop.json
- registerSessionKnowledgeRoutes
- theme-contrast.test.ts
- .oxlintrc.json
- settings-local.json
- SessionAdmissions
- ManagerAssistant.tsx
- pending-echo.ts
- copilot-sdk-client.ts
- html-preview.ts
- .initialize
- ChatMessage
- session-response-order.ts
- generate-pwa-icons.ts
- dreamer-routes.ts
- manager-structured-memory-performance.test.ts
- bridge.rs
- screenshot-stability.test.ts
- KnowledgePosition
- promotion-setup-execution.test.ts
- voice-recorder.ts
- package.json
- SessionFileUpload
- release-publication.test.ts
- render-workspace-gifs.ts
- history-projection.test.ts
- settings-profile-routes.ts
- settings.ts
- composer-layout.test.ts
- dreamer-store.test.ts
- vite.config.ts
- hasActiveBackgroundTasks
- removeComputer
- FakeRecorder
- MarkdownCodeBlock.tsx
- .discoverTerminalSessions
- terminal-send-uncertainty.test.ts
- MockMediaRecorder
- MermaidDiagram.tsx
- version-policy.test.ts
- MermaidDiagram.test.tsx
- tsconfig.json
- ffprobe-static
- lucide-react
- pdfjs-dist
- react
- remark-parse
- web-push
- sw.js
- recovery-question-styles.test.ts
- agentic-remote-shell

## God Nodes (most connected - your core abstractions)
1. `SessionDetail` - 299 edges
2. `App()` - 275 edges
3. `AgentService` - 265 edges
4. `SessionStore` - 179 edges
5. `ClaudeAgentService` - 124 edges
6. `ManagedSession` - 98 edges
7. `registerHubRoutes()` - 91 edges
8. `ComputerManager` - 86 edges
9. `buildApp()` - 73 edges
10. `ManagerAgent` - 73 edges

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

## Communities (181 total, 20 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.04
Nodes (9): agentMode(), AgentService, restart(), RuntimeConfigurationError, queueConflict(), fixture(), httpBoundary(), isRetainedRefusal() (+1 more)

### Community 1 - "App.tsx"
Cohesion: 0.02
Nodes (122): isManagerEvent(), alertNotification(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage() (+114 more)

### Community 2 - "App"
Cohesion: 0.04
Nodes (136): terminalSendOptions(), submissionReceiptFromError(), activeComposerPastes(), App(), adoptConversationReplacement(), appendComposerForKey(), appKeyDown(), applyComputerSnapshot() (+128 more)

### Community 3 - "api.ts"
Cohesion: 0.03
Nodes (115): SettingsChange, SettingsProfileKey, SettingsUpdateResult, parseSubmissionReceipt(), addKnowledgeRoot(), askSession(), bootstrapSessionOrder(), cancelBackgroundTask() (+107 more)

### Community 4 - "SessionDetail"
Cohesion: 0.05
Nodes (32): storage(), createStore(), recoveryFixture(), fixture(), fixture(), channels, directories, fixture() (+24 more)

### Community 5 - "ClaudeAgentService"
Cohesion: 0.05
Nodes (13): ClaudeAgentService, isMissingClaudeSessionError(), cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle() (+5 more)

### Community 6 - "background-task-adapter.ts"
Cohesion: 0.05
Nodes (82): addActivity(), attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), boundedText(), CopilotClientTaskInfo (+74 more)

### Community 7 - "terminal-session.ts"
Cohesion: 0.05
Nodes (86): activeBottomFrame(), boxedComposerFrame(), captureBeforeDeadline(), captureTerminal(), cleanDialogLine(), clearAutomaticStartupPrompts(), COMPOSER_PLACEHOLDERS, composerFocusedPanes (+78 more)

### Community 8 - "CopilotSessionLike"
Cohesion: 0.04
Nodes (42): CopilotSessionLike, busyTerminal(), configurableModel(), FakeCopilotClient, probeService(), startupFifoFixture(), terminalService(), CopilotTasksApi (+34 more)

### Community 9 - "multi-node.test.ts"
Cohesion: 0.04
Nodes (22): ClaudeAgentServiceEvents, DirectoryScope, directories, FakeSessionService, routingFixture(), session(), temporaryDirectory(), ProviderSessionServiceEvents (+14 more)

### Community 10 - "session-store.ts"
Cohesion: 0.03
Nodes (56): CopilotClientLike, fixture(), holdProbe(), fixtures, gate(), releases, directories, fakeClient() (+48 more)

### Community 11 - "RemoteNodeClient"
Cohesion: 0.04
Nodes (28): RemoteResync, RemoteSessionRead, AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, DEFINITE_DISPATCH_REFUSALS, headerSafe(), normalizeNodeUrl(), REDIRECT_STATUSES (+20 more)

### Community 12 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (77): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url(), CANARY (+69 more)

### Community 13 - "ManagedSession"
Cohesion: 0.10
Nodes (13): ComputerManager, managedSession(), mapWithConcurrency(), sessionAtLeastAsNew(), RegisteredComputer, registerHubRoutes(), SessionMuteCarrier, FakeManager (+5 more)

### Community 14 - "claude-agent-service.ts"
Cohesion: 0.07
Nodes (54): AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission, PendingClaudeReply (+46 more)

### Community 15 - "ManagerAgent"
Cohesion: 0.08
Nodes (14): checkContent(), delay(), discover(), errorMessage(), isNotFound(), ManagerAgent, ManagerSdkSession, sameRuntime() (+6 more)

### Community 16 - "PushNotificationService"
Cohesion: 0.07
Nodes (28): brief(), HubEventSource, OracleEventSource, PushNotificationService, PushPolicy, PushSender, PushState, directories (+20 more)

### Community 17 - "transcription-service.ts"
Cohesion: 0.06
Nodes (36): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, registerTranscriptionRoutes() (+28 more)

### Community 18 - "active-sessions.ts"
Cohesion: 0.06
Nodes (52): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+44 more)

### Community 19 - "session-presentation.ts"
Cohesion: 0.06
Nodes (52): react, saveSessionOrderLane(), handleDragEnd(), DialogFrame(), KnowledgeRootSelector(), root, reorderSessionLaneWithHiddenFollowers(), SessionFilter (+44 more)

### Community 20 - "manager-tools.ts"
Cohesion: 0.07
Nodes (32): APPROVE_WORDS, computerField, createManagerTools(), define(), deliver(), requireComputer(), resolveSession(), steer() (+24 more)

### Community 21 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 22 - "contracts.ts"
Cohesion: 0.05
Nodes (41): RemoteSessionListing, readSessionMcpServers(), ResourceRead, sameResourceOwner(), unavailableMcp(), ActivityStatus, AddComputerInput, AddKnowledgeRootInput (+33 more)

### Community 23 - "TmuxTerminalSessionController"
Cohesion: 0.10
Nodes (17): copilotCommand(), endProbeSession(), execFileAsync, FormReplyDeadlineError, formReplyExpired(), listTmuxSessions(), processAncestors(), processCommand() (+9 more)

### Community 24 - "markdown-navigation.ts"
Cohesion: 0.07
Nodes (43): executeCommand(), listWorkspace(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink(), KnowledgeReader(), markdownComponentsFor() (+35 more)

### Community 25 - "agent-service.ts"
Cohesion: 0.04
Nodes (52): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), ActivityToolStart, AgentServiceEvents, ansiSequence, commandShortcut() (+44 more)

### Community 26 - "SessionService"
Cohesion: 0.07
Nodes (10): ActiveClaudeQuery, registerNodeRoutes(), releases, session, snapshot, readServiceResources(), readSessionSkills(), ResourceReads (+2 more)

### Community 27 - "session-knowledge-store.ts"
Cohesion: 0.07
Nodes (29): bindingKey(), bindingSchema, Identity, PathRecord, pathRecordKey(), PathState, pathStateFor(), pathStateSchema (+21 more)

### Community 28 - "session-enqueue-clear.test.ts"
Cohesion: 0.05
Nodes (40): ClaudeSdk, connect(), deferred(), disk, enqueue(), fixture(), fixtures, holdClaimWrite() (+32 more)

### Community 29 - "ManagerStore"
Cohesion: 0.08
Nodes (16): openStore(), TurnContextInput, JournalRecorder, JournalRecorderOptions, sessionTask(), emptyState(), JournalDraft, JournalEntry (+8 more)

### Community 30 - "app.ts"
Cohesion: 0.07
Nodes (29): prefixes, session, trusted, untrusted, directories, buildApp(), BuildAppOptions, errorStatusCode() (+21 more)

### Community 31 - "session-knowledge-routes.test.ts"
Cohesion: 0.06
Nodes (24): ServerRole, fixture(), managers, releases, remote, session(), SessionMetadataLookup, ComputerRegistry (+16 more)

### Community 32 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 33 - "hub-routes.ts"
Cohesion: 0.06
Nodes (37): ClientPresence, PRESENCE_TTL_MS, addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema (+29 more)

### Community 34 - "terminal-startup-queue.test.ts"
Cohesion: 0.11
Nodes (36): startAgentAfterClear(), exec, formFixture(), horizontalFormFixture(), textFieldFormFixture(), directories, exec, client() (+28 more)

### Community 36 - "DreamerStore"
Cohesion: 0.13
Nodes (10): assertUniqueJsonKeys(), clone(), DreamerCapacityError, DreamerConflictError, DreamerRecoveryError, DreamerStore, isMissing(), publicPlan() (+2 more)

### Community 37 - "pwa.ts"
Cohesion: 0.10
Nodes (36): deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate(), toggle() (+28 more)

### Community 38 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 39 - "lib.rs"
Cohesion: 0.14
Nodes (33): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+25 more)

### Community 40 - "workspace-fixtures.ts"
Cohesion: 0.08
Nodes (30): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, createWorkspaceFixtureState() (+22 more)

### Community 41 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 42 - "terminal-session.test.ts"
Cohesion: 0.08
Nodes (31): composerHoldsOtherText(), composerTookPaste(), isTerminalVisiblyIdle(), occurrences(), paneEvidenceCount(), paneShowsText(), parseTerminalUpdateNotice(), pasteCouldCollapse() (+23 more)

### Community 43 - "agentic-remote-gate"
Cohesion: 0.12
Nodes (36): agentic-remote-gate script, assert_tree(), CLONE_BASE, conclude(), CONTEXT, die(), elapsed(), fail() (+28 more)

### Community 44 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 45 - "knowledge-tree.ts"
Cohesion: 0.09
Nodes (34): WorkspaceEntry, listKnowledgeEntries(), readKnowledgeFile(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor() (+26 more)

### Community 46 - ".sendAdmittedWithBackend"
Cohesion: 0.09
Nodes (3): removeCopilotSessionFiles(), terminalAnswerRefused(), TerminalSessionController

### Community 47 - "dependencies"
Cohesion: 0.06
Nodes (35): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/static, @fastify/websocket (+27 more)

### Community 48 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 49 - "manager-agent.ts"
Cohesion: 0.10
Nodes (23): ManagerEventSource, isPending(), isQueued(), ManagerAgentOptions, Rung, TURN_ACTIVITY, ManagerState, trusted (+15 more)

### Community 50 - "agentic-remote"
Cohesion: 0.13
Nodes (31): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+23 more)

### Community 51 - "manager-structured-memory.ts"
Cohesion: 0.07
Nodes (28): ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryStoreOptions, open(), openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS (+20 more)

### Community 52 - "node-routes.ts"
Cohesion: 0.07
Nodes (28): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile(), configureRuntimeSchema, createSessionSchema (+20 more)

### Community 53 - "normalizeKnowledgeRelativePath"
Cohesion: 0.10
Nodes (24): knowledgeFileSchema, knowledgeRelativePathSchema, scopedKnowledgePath(), Lineage, RegistrationGeneration, ReplacementEvidence, SessionKnowledgeLifecycle, sessionParams (+16 more)

### Community 54 - "dreamer-planner.ts"
Cohesion: 0.12
Nodes (27): activeDreamerMemoryIds(), activeMemoryRecord(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), digest(), DREAMER_DEFAULT_STALE_AFTER_MS (+19 more)

### Community 55 - "manager-agent.test.ts"
Cohesion: 0.09
Nodes (14): ManagerSdkClient, ManagerSdkEvent, ManagerSdkSessionConfig, Behavior, capturePrompt(), computers, fail(), FakeClient (+6 more)

### Community 56 - "SessionOrderStore"
Cohesion: 0.15
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 57 - "OracleDreamer.tsx"
Cohesion: 0.14
Nodes (21): DreamerPlanItem, DreamerPlanItemSource, DreamerApiError, DreamerPlanEdit, DreamerSettingsEdit, getDreamer(), request(), saveDreamerSettings() (+13 more)

### Community 58 - "DreamerService"
Cohesion: 0.21
Nodes (5): DreamerMemoryMetadata, setup(), DreamerService, publicSnapshot(), DreamerSnapshot

### Community 59 - "settings-profile-store.ts"
Cohesion: 0.12
Nodes (17): directories, fakeManager(), hub(), local, profileStore(), SettingsProfileState, SettingsProfileStore, directories (+9 more)

### Community 60 - "shared/settings-profile.ts"
Cohesion: 0.10
Nodes (28): AccentSetting, appearanceSettings, isRecord(), isSettingsDeviceId(), isSettingsRevision(), NewSessionBackendSetting, newSessionBackendSettings, NewSessionFoldersSetting (+20 more)

### Community 61 - "startup-phases.test.ts"
Cohesion: 0.10
Nodes (14): phases, port, createStartupPhases(), silentStartupPhases, startManagedServer(), StartupPhaseEvent, StartupPhaseRecord, StartupPhases (+6 more)

### Community 62 - "session-patch-browser.ts"
Cohesion: 0.14
Nodes (25): advance(), connections, content(), FrameMeasurement, instrument(), lastHeading(), message(), open() (+17 more)

### Community 63 - "UserInputReplyInput"
Cohesion: 0.18
Nodes (6): isUncertainDelivery(), persistedFormAnswer(), TerminalFormContinuation, TerminalFormReplyError, UserInputReplyInput, deliveryUncertaintyFromError()

### Community 64 - "agent-service.test.ts"
Cohesion: 0.09
Nodes (14): foregroundTurnOpen(), isForegroundCompletionEvent(), isForegroundLifecycleEvent(), statusFromEvents(), terminalFormSteps(), DeferredSession, directories, normalSdkSessionConfiguration (+6 more)

### Community 65 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 66 - "dreamer-store.ts"
Cohesion: 0.12
Nodes (24): assertInteger(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS, DREAMER_MAX_STATE_BYTES, DREAMER_STAGING_PREFIX, DREAMER_STATE_VERSION (+16 more)

### Community 67 - "send-matrix.integration.test.ts"
Cohesion: 0.08
Nodes (23): BUSY, busyWithoutComposer, CLEAR_REFUSED, client(), dialogs, Draft, drained, exec (+15 more)

### Community 68 - "session-resource-clear.test.ts"
Cohesion: 0.09
Nodes (25): apps, directories, directory(), obstructUploads(), pairedFixture(), providerFixture(), providers, seed() (+17 more)

### Community 69 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 70 - "dreamer-service.ts"
Cohesion: 0.10
Nodes (20): DREAMER_MAX_ITEMS, DreamerMemoryMetadataRecord, DreamerPlanDraft, DreamerPlannerInput, projectDreamerMemory(), digest(), DreamerPlannerExecutionInput, DreamerServiceOptions (+12 more)

### Community 71 - "manager-structured-memory-search.ts"
Cohesion: 0.14
Nodes (22): authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord(), ManagerStructuredMemoryFormattedContext (+14 more)

### Community 72 - "SettingsProfileClient"
Cohesion: 0.19
Nodes (5): sameSettingValue(), errorText(), isRefusal(), samePending(), SettingsProfileClient

### Community 73 - "KnowledgeStore"
Cohesion: 0.18
Nodes (7): WorkspaceFixtureState, KnowledgeRootReservation, KnowledgeState, KnowledgeStore, directories, fixture(), KnowledgeRoot

### Community 74 - "recordValue"
Cohesion: 0.22
Nodes (18): activityKind(), activityResult(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), isBackgroundTaskEvent(), isMissingSessionError() (+10 more)

### Community 75 - "src/settings-profile.ts"
Cohesion: 0.11
Nodes (20): AppearanceSetting, NewSessionRuntime, settingsProfileKeys, SettingsProfileValues, statuslineItems, Appearance, appearanceFrom(), appearanceStorageKey (+12 more)

### Community 76 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 77 - "manager-context.ts"
Cohesion: 0.16
Nodes (17): ago(), attentionRank(), buildTurnContext(), changeLines(), clock(), MANAGER_STRUCTURED_MEMORY_SYSTEM_PROMPT, MANAGER_SYSTEM_PROMPT, managerPrompt() (+9 more)

### Community 78 - "ManagerStructuredMemoryStore"
Cohesion: 0.23
Nodes (7): digest(), ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryStore, ManagerStructuredMemoryCorrectInput, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryRememberInput, ManagerStructuredMemoryState

### Community 79 - "refusal-metrics.ts"
Cohesion: 0.13
Nodes (17): countsAsRefusal(), DEFAULT_MAX_REFUSAL_KEYS, httpRefusalReason(), keyId(), notedReasons, noteRefusalReason(), overflowId, reasonCodeFromChain() (+9 more)

### Community 80 - "HubEvent"
Cohesion: 0.15
Nodes (10): Connection, ComputerManagerEvents, Client, PatchSocket, Browser, seedOffset, HubEvent, HubResyncRequest (+2 more)

### Community 81 - "manager-routes.ts"
Cohesion: 0.13
Nodes (14): confirmationSchema, defaultsSchema, editSchema, effort, managerInputError(), ManagerRouteAgent, messageParams, registerManagerRoutes() (+6 more)

### Community 82 - ".sendInternal"
Cohesion: 0.21
Nodes (12): capturePane(), composerHoldsText(), composerText(), hasComposerAfter(), isTerminalAgentWorking(), isTerminalOverlay(), isTerminalSessionInUsePrompt(), parseTerminalFormPrompt() (+4 more)

### Community 83 - "capture-workspace.ts"
Cohesion: 0.20
Nodes (20): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+12 more)

### Community 84 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 85 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (19): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+11 more)

### Community 86 - "ManagerAssistant"
Cohesion: 0.14
Nodes (19): editQueuedManagerMessage(), applyEvent(), canTakeFocus(), ManagerAssistant(), act(), announce(), cancelEdit(), onEditKeyDown() (+11 more)

### Community 87 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 88 - ".toolHost"
Cohesion: 0.14
Nodes (4): ManagerHub, hasExplicitStructuredMemoryIntent(), memoryObject, StructuredMemoryMutationOperation

### Community 89 - "session-reply-durability.test.ts"
Cohesion: 0.16
Nodes (16): assistantFixture(), claudeFixture(), claudeQuestions(), claudeRunFixture(), copilotFixture(), copilotRunFixture(), disk, emptyComposer (+8 more)

### Community 90 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (9): claude(), clearFixture(), copilot(), disk, event(), fixtures, releases, sdkSession() (+1 more)

### Community 91 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 92 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 93 - "server/side-question.ts"
Cohesion: 0.20
Nodes (10): SIDE_QUESTION_CLEANUP_MS, SIDE_QUESTION_RUNTIME_IDLE_MS, SIDE_QUESTION_TIMEOUT_MS, sideQuestionBoundary(), SideQuestionError, sideQuestionPrompt(), withSideQuestionTimeout(), SIDE_QUESTION_EARLIER_ANSWER_MAX_LENGTH (+2 more)

### Community 94 - "directory-browser.ts"
Cohesion: 0.23
Nodes (11): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin(), SessionDirectoryError (+3 more)

### Community 95 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 96 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 97 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 98 - "SettingsProfileSnapshot"
Cohesion: 0.17
Nodes (6): SettingsProfileSnapshot, settingsProfileCacheKey, SettingsProfileTransport, cached(), FakeHub, MemoryStorage

### Community 99 - "use-oracle-settings.ts"
Cohesion: 0.20
Nodes (12): RuntimeModelOption, getManager(), updateManagerSettings(), effortFrom(), efforts, OracleModelSettings(), OracleSettingsStatus(), HarnessProps (+4 more)

### Community 100 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 101 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 102 - "use-session-knowledge-root.ts"
Cohesion: 0.21
Nodes (12): getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey(), knowledgePositionForBinding(), SessionIdentity (+4 more)

### Community 103 - "terminal-form-deadline.test.ts"
Cohesion: 0.15
Nodes (12): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+4 more)

### Community 104 - "session-latency-benchmark.ts"
Cohesion: 0.23
Nodes (15): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+7 more)

### Community 105 - "SessionStatus"
Cohesion: 0.16
Nodes (14): Seen, Row, SessionExecutionMode, SessionStatus, TerminalSendPolicyInput, TerminalSendRequestOptions, booleans, combinations (+6 more)

### Community 106 - "promotion-monitor.test.ts"
Cohesion: 0.28
Nodes (14): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+6 more)

### Community 107 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 108 - "server/session-patches.ts"
Cohesion: 0.22
Nodes (7): diffMessages(), Publication, sameMessage(), sessionKey(), SessionPublications, SessionUpserted, SessionMessagesPatch

### Community 109 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 110 - "NewSessionDialog"
Cohesion: 0.20
Nodes (16): activateSession(), createSession(), listDirectories(), listHistory(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), reopenInterruptedSession() (+8 more)

### Community 111 - "ManagerAssistant.test.tsx"
Cohesion: 0.13
Nodes (9): removeQueuedManagerMessage(), resolveManagerConfirmation(), retryManagerMessage(), sessionLinkTarget(), OracleButton(), OracleControl, OracleIndicator, empty (+1 more)

### Community 112 - "check-workspace-review-regressions.ts"
Cohesion: 0.14
Nodes (12): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+4 more)

### Community 113 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+7 more)

### Community 114 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 115 - "registerSessionKnowledgeRoutes"
Cohesion: 0.30
Nodes (11): registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession(), recordReplacement() (+3 more)

### Community 116 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 117 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 118 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 119 - "SessionAdmissions"
Cohesion: 0.18
Nodes (4): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions

### Community 120 - "ManagerAssistant.tsx"
Cohesion: 0.22
Nodes (9): boundWidth(), ORACLE_CONVERSATION_WIDTH_MIN, ORACLE_PANEL_WIDTH_MIN, readWidth(), storeWidth(), suggestions, usePanelWidth(), commit() (+1 more)

### Community 121 - "pending-echo.ts"
Cohesion: 0.28
Nodes (9): nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, prunePendingEchoMap(), retainPendingEchoes(), sameText() (+1 more)

### Community 122 - "copilot-sdk-client.ts"
Cohesion: 0.29
Nodes (9): COPILOT_SDK_SESSION_DISCOVERY, COPILOT_SDK_SESSION_INTERACTION, copilotSdkClientOptions(), CopilotSdkMissingSessionRetirement, CopilotSdkRuntimeDiagnostic, CopilotSdkRuntimeDiagnosticClient, createCopilotSdkClient(), readCopilotSdkRuntimeDiagnostic() (+1 more)

### Community 123 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 124 - ".initialize"
Cohesion: 0.27
Nodes (3): isMissing(), ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryRecoveryError

### Community 125 - "ChatMessage"
Cohesion: 0.24
Nodes (9): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, message(), sendLikeTheApp(), StoredSession, ChatMessage (+1 more)

### Community 126 - "session-response-order.ts"
Cohesion: 0.33
Nodes (9): carrySnapshotTranscripts(), currentSessionEventSequence(), nextSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences, sessionResponseStartedAt(), failure (+1 more)

### Community 127 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 128 - "dreamer-routes.ts"
Cohesion: 0.27
Nodes (7): parse(), planSchema, registerDreamerRoutes(), settingsSchema, apps, directories, DreamerUnavailableError

### Community 129 - "manager-structured-memory-performance.test.ts"
Cohesion: 0.27
Nodes (7): benchmarkState(), now(), openFixture(), searchSamples(), MANAGER_STRUCTURED_MEMORY_MAX_STORE_BYTES, ManagerStructuredMemorySearchResult, submitSearch()

### Community 130 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 131 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 132 - "KnowledgePosition"
Cohesion: 0.33
Nodes (5): WorkspaceFixtureOptions, KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 133 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 134 - "voice-recorder.ts"
Cohesion: 0.28
Nodes (3): recordingDuration(), FakeRecorder, useVoiceRecorder()

### Community 135 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, packageManager, private, type, version

### Community 137 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 138 - "render-workspace-gifs.ts"
Cohesion: 0.29
Nodes (6): directory, { values }, workflows, pnpm, onlyBuiltDependencies, ffmpeg-static

### Community 139 - "history-projection.test.ts"
Cohesion: 0.33
Nodes (5): eventsFor(), ModelMessage, random(), seedOffset, terminalTypes

### Community 140 - "settings-profile-routes.ts"
Cohesion: 0.33
Nodes (6): deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, SETTINGS_DEVICE_ID_MAX_LENGTH

### Community 141 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 142 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 143 - "dreamer-store.test.ts"
Cohesion: 0.33
Nodes (3): DREAMER_MAX_ZONES, directories, plan

### Community 144 - "vite.config.ts"
Cohesion: 0.33
Nodes (4): canaryTests, packageVersion, slowTests, tmuxTests

### Community 146 - "removeComputer"
Cohesion: 0.60
Nodes (5): addComputer(), removeComputer(), ComputersDialog(), remove(), submit()

### Community 153 - "MermaidDiagram.tsx"
Cohesion: 0.67
Nodes (3): drawDiagram(), drawing, MermaidDiagram()

## Knowledge Gaps
- **948 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+943 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1457 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **20 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `SessionService` connect `SessionService` to `multi-node.test.ts`, `RemoteNodeClient`, `startup-phases.test.ts`, `claude-agent-service.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `composerFocusWitnessed()` connect `terminal-session.ts` to `TmuxTerminalSessionController`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `App()` (e.g. with `createSettingsProfileClient()` and `prefersLightNow()`) actually correct?**
  _`App()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _948 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.037702628862849856 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.021340042866461652 - nodes in this community are weakly interconnected._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.03665564478034955 - nodes in this community are weakly interconnected._
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
- `.github/workflows/light-check.yml`
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
- `docs/design/oracle-dreamer.md`
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
- `docs/superpowers/plans/2026-10-20-copilot-sdk-cli-parity.md`
- `docs/superpowers/specs/2026-10-16-oracle-structured-memory-design.md`
- `docs/superpowers/specs/2026-10-20-copilot-sdk-cli-parity-design.md`
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
- `src/dreamer.css`
- `src/index.css`
