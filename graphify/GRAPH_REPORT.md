# Agentic Remote - Graphify code map

Snapshot: `5a86583faf2bdedaa88238307cf661dee91117d2b3233b22a2cfc95b213ce698`

Source checkout: `bee84816e11595c20293c60aa27dbd5c532e6a9e`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 307 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 307 files · ~617,220 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 4712 nodes · 13326 edges · 179 communities (138 shown, 26 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 883 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- App
- api.ts
- App.tsx
- session-store.ts
- SessionDetail
- computer-manager.ts
- SessionStore
- session-resources.ts
- PushNotificationService
- agentic-remote-promotion-monitor
- session-presentation.ts
- CopilotSessionLike
- transcription-service.ts
- active-sessions.ts
- ManagerAgent
- terminal-session.ts
- TmuxTerminalSessionController
- claude-agent-service.ts
- manager-structured-memory-validation.ts
- ManagedSession
- TerminalSessionController
- markdown-navigation.ts
- agent-service.ts
- session-resource-clear.test.ts
- registerHubRoutes
- app.ts
- session-knowledge-routes.test.ts
- session-latency-benchmark.ts
- bundle
- ProviderSessionService
- hub-routes.ts
- lib.rs
- tmux-test-helpers.ts
- pwa.ts
- shell.ts
- SessionService
- contracts.ts
- .sendInternal
- agentic-remote-promotion-setup
- config.rs
- normalizeKnowledgeRelativePath
- FakeSessionService
- devDependencies
- agentic-remote
- node-routes.ts
- manager-agent.ts
- manager-agent.test.ts
- dependencies
- src/settings-profile.ts
- terminal-startup-queue.test.ts
- manager-structured-memory.ts
- SessionOrderStore
- manager-store.ts
- terminal-session.test.ts
- background-task-adapter.ts
- settings-profile-store.ts
- shared/settings-profile.ts
- session-patch-browser.ts
- KnowledgeStore
- backgroundTasksFromEvents
- cli-canary.ts
- ManagerStore
- scripts
- ManagerStructuredMemoryStore
- manager-structured-memory-search.ts
- SettingsProfileClient
- workspace-fixtures.ts
- directory-browser.ts
- ManagerAssistant.tsx
- compilerOptions
- ManagerMessage
- manager-context.ts
- ManagerAssistant
- capture-workspace.ts
- session-clear-transcript.test.ts
- session-reply-durability.test.ts
- .handleSessionEvent
- use-oracle-settings.ts
- startup-phases.test.ts
- session-store-providers.test.ts
- PromptCards.tsx
- compilerOptions
- .correct
- knowledge-tree.ts
- compilerOptions
- compilerOptions
- agent-service.test.ts
- .toolHost
- ManagerMemory
- session-knowledge-store.ts
- workspace-browser.ts
- ComputerSummary
- ReaderWorkspace
- background-task-stop.test.ts
- recovery-resend-durability.test.ts
- SessionKnowledgeStore
- server/session-patches.ts
- session-resource-routes.test.ts
- NewSessionDialog
- capture
- check-workspace-review-regressions.ts
- terminal-form-deadline.test.ts
- .withFormViewport
- capture-workbench-review.ts
- desktop.json
- registerSessionKnowledgeRoutes
- theme-contrast.test.ts
- .oxlintrc.json
- settings-local.json
- .askSession
- .startAdmitted
- promotion-monitor.test.ts
- session-response-order.ts
- scripts
- background-task-tracker.ts
- recovery-seed-guards.test.ts
- BackgroundTasksDialog.tsx
- html-preview.ts
- session-knowledge-routes.ts
- server/side-question.ts
- generate-pwa-icons.ts
- DeferredSession
- .persist
- bridge.rs
- screenshot-stability.test.ts
- promotion-setup-execution.test.ts
- session-knowledge-store.test.ts
- session-resource-transport.ts
- settings-profile.test.ts
- voice-recorder.ts
- KnowledgePosition
- package.json
- backgroundHandoff
- release-publication.test.ts
- requestVoid
- render-workspace-gifs.ts
- history-projection.test.ts
- settings-profile-routes.ts
- settings.ts
- .transport
- toolActivityContent
- composer-layout.test.ts
- usePanelWidth
- hasRunningBackgroundAgent
- FakeRecorder
- MarkdownCodeBlock.tsx
- .discoverTerminalSessions
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
1. `SessionDetail` - 298 edges
2. `App()` - 268 edges
3. `AgentService` - 259 edges
4. `SessionStore` - 176 edges
5. `ClaudeAgentService` - 123 edges
6. `ManagedSession` - 98 edges
7. `registerHubRoutes()` - 90 edges
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
- `AgentServiceEvents` --references--> `ServerEvent`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (179 total, 26 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.04
Nodes (10): agentMode(), AgentService, foregroundTurnOpen(), isMissingSessionError(), removeCopilotSessionFiles(), RuntimeConfigurationError, terminalAnswerRefused(), queueConflict() (+2 more)

### Community 1 - "App"
Cohesion: 0.03
Nodes (150): isManagerEvent(), alertNotification(), askSession(), deleteSession(), listKnowledgeEntries(), readKnowledgeFile(), activeComposerPastes(), App() (+142 more)

### Community 2 - "api.ts"
Cohesion: 0.03
Nodes (109): parseSubmissionReceipt(), submissionReceiptFromError(), addKnowledgeRoot(), bootstrapSessionOrder(), cancelBackgroundTask(), cancelSession(), clearConversation(), configureRetention() (+101 more)

### Community 3 - "App.tsx"
Cohesion: 0.03
Nodes (97): AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph(), activityStatusLabel() (+89 more)

### Community 4 - "session-store.ts"
Cohesion: 0.03
Nodes (81): CopilotClientLike, fixture(), holdProbe(), fixtures, gate(), releases, directories, fakeClient() (+73 more)

### Community 5 - "SessionDetail"
Cohesion: 0.05
Nodes (7): ClaudeAgentService, isMissingClaudeSessionError(), waitForIdle(), preparePrompt(), copilotRequest(), QueuedPromptReservation, SessionDetail

### Community 6 - "computer-manager.ts"
Cohesion: 0.04
Nodes (36): RemoteResync, RemoteSessionRead, AUDIO_FILENAME_HEADER, DEFINITE_DISPATCH_REFUSALS, headerSafe(), normalizeNodeUrl(), REDIRECT_STATUSES, RemoteNodeClient (+28 more)

### Community 7 - "SessionStore"
Cohesion: 0.05
Nodes (11): storage(), fixture(), observe(), canArchiveSession(), clearRecoverySeedFailure(), cloneSession(), grantTerminalRecovery(), ownsRecoverySeedFailure() (+3 more)

### Community 8 - "session-resources.ts"
Cohesion: 0.07
Nodes (50): ActiveClaudeQuery, ClaudeResources, releases, session, snapshot, claudeMcp(), claudeSkillNames(), copilotMcp (+42 more)

### Community 9 - "PushNotificationService"
Cohesion: 0.06
Nodes (33): WorkspaceFixture, ComputerManagerEvents, ManagerEventSource, brief(), HubEventSource, OracleEventSource, PushNotificationService, PushPolicy (+25 more)

### Community 10 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (71): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+63 more)

### Community 11 - "session-presentation.ts"
Cohesion: 0.06
Nodes (56): react, saveSessionOrderLane(), handleDragEnd(), DialogFrame(), KnowledgeRootSelector(), root, reorderSessionLaneWithHiddenFollowers(), SessionFilter (+48 more)

### Community 12 - "CopilotSessionLike"
Cohesion: 0.05
Nodes (31): CopilotSessionLike, CopilotTasksApi, acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight() (+23 more)

### Community 13 - "transcription-service.ts"
Cohesion: 0.06
Nodes (35): BuildAppOptions, collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation (+27 more)

### Community 14 - "active-sessions.ts"
Cohesion: 0.06
Nodes (50): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates(), isCopilotProcess() (+42 more)

### Community 15 - "ManagerAgent"
Cohesion: 0.09
Nodes (11): checkContent(), delay(), discover(), errorMessage(), isNotFound(), ManagerAgent, sameRuntime(), TurnError (+3 more)

### Community 16 - "terminal-session.ts"
Cohesion: 0.06
Nodes (54): boxedComposerFrame(), captureTerminal(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFrameText(), composerHasFocus(), composerRowText(), cursorComposerFrame() (+46 more)

### Community 17 - "TmuxTerminalSessionController"
Cohesion: 0.08
Nodes (22): copilotCommand(), endProbeSession(), execFileAsync, formReplyExpired(), parseTerminalUpdateNotice(), processAncestors(), processCommand(), processIsAlive() (+14 more)

### Community 18 - "claude-agent-service.ts"
Cohesion: 0.07
Nodes (27): AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission, PendingClaudeReply (+19 more)

### Community 19 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (52): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+44 more)

### Community 20 - "ManagedSession"
Cohesion: 0.08
Nodes (31): RemoteSessionListing, APPROVE_WORDS, computerField, createManagerTools(), define(), deliver(), requireComputer(), resolveSession() (+23 more)

### Community 21 - "TerminalSessionController"
Cohesion: 0.07
Nodes (10): isForegroundCompletionEvent(), isForegroundLifecycleEvent(), isUncertainDelivery(), persistedFormAnswer(), statusFromEvents(), TerminalFormContinuation, TerminalFormReplyError, TerminalSessionController (+2 more)

### Community 22 - "markdown-navigation.ts"
Cohesion: 0.07
Nodes (42): executeCommand(), listWorkspace(), readWorkspaceFile(), searchWorkspace(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink() (+34 more)

### Community 23 - "agent-service.ts"
Cohesion: 0.04
Nodes (46): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), ActivityToolStart, AgentServiceEvents, ansiSequence, commandShortcut() (+38 more)

### Community 24 - "session-resource-clear.test.ts"
Cohesion: 0.06
Nodes (42): ClaudeSdk, cleanupFixtures(), directories, fixture(), queryHandle(), services, disk, EnqueueCase (+34 more)

### Community 25 - "registerHubRoutes"
Cohesion: 0.16
Nodes (4): ComputerManager, managedSession(), registerHubRoutes(), ManagedRemovedQueuedPrompt

### Community 26 - "app.ts"
Cohesion: 0.07
Nodes (26): prefixes, session, trusted, untrusted, directories, buildApp(), errorStatusCode(), isAppleTouchIconProbe() (+18 more)

### Community 27 - "session-knowledge-routes.test.ts"
Cohesion: 0.06
Nodes (23): ServerRole, managers, releases, remote, SessionMetadataLookup, ComputerRegistry, RegisteredComputer, RegistryState (+15 more)

### Community 28 - "session-latency-benchmark.ts"
Cohesion: 0.08
Nodes (28): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+20 more)

### Community 29 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 31 - "hub-routes.ts"
Cohesion: 0.05
Nodes (38): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+30 more)

### Community 32 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 33 - "tmux-test-helpers.ts"
Cohesion: 0.12
Nodes (31): exec, formFixture(), horizontalFormFixture(), textFieldFormFixture(), directories, exec, assertSameIdentity(), createIsolatedTmuxRoot() (+23 more)

### Community 34 - "pwa.ts"
Cohesion: 0.10
Nodes (36): deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate(), toggle() (+28 more)

### Community 35 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 37 - "contracts.ts"
Cohesion: 0.06
Nodes (31): idleDaysSchema, mergeSessionRetention(), sessionRetentionPatchSchema, sessionRetentionSchema, ActivityStatus, AddKnowledgeRootInput, BackgroundTaskAttachmentMode, BackgroundTaskExecutionMode (+23 more)

### Community 38 - ".sendInternal"
Cohesion: 0.15
Nodes (32): activeBottomFrame(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), composerFocusWitnessed(), composerHoldsText(), composerText(), containsCopiedInteractiveFrame() (+24 more)

### Community 39 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 40 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 41 - "normalizeKnowledgeRelativePath"
Cohesion: 0.11
Nodes (28): SessionKnowledgeBinding, joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath(), slashPath(), getSessionKnowledgeRoot() (+20 more)

### Community 42 - "FakeSessionService"
Cohesion: 0.08
Nodes (5): FakeSessionService, routingFixture(), session(), temporaryDirectory(), SideQuestionExchange

### Community 43 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 44 - "agentic-remote"
Cohesion: 0.13
Nodes (31): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+23 more)

### Community 45 - "node-routes.ts"
Cohesion: 0.07
Nodes (29): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile(), AUDIO_TYPE_HEADER, configureRuntimeSchema (+21 more)

### Community 46 - "manager-agent.ts"
Cohesion: 0.09
Nodes (21): isPending(), isQueued(), Rung, TURN_ACTIVITY, ManagerState, hasExplicitStructuredMemoryIntent(), memoryObject, StructuredMemoryMutationOperation (+13 more)

### Community 47 - "manager-agent.test.ts"
Cohesion: 0.08
Nodes (15): ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig, Behavior, capturePrompt(), computers, fail() (+7 more)

### Community 48 - "dependencies"
Cohesion: 0.06
Nodes (33): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, @fastify/multipart, @fastify/static, @fastify/websocket, lucide-react (+25 more)

### Community 49 - "src/settings-profile.ts"
Cohesion: 0.09
Nodes (25): AppearanceSetting, NewSessionRuntime, SETTINGS_MAX_COMPUTERS, SettingsChange, SettingsProfileKey, settingsProfileKeys, SettingsProfileValues, SettingsUpdateResult (+17 more)

### Community 50 - "terminal-startup-queue.test.ts"
Cohesion: 0.13
Nodes (26): findActiveCopilotSessions(), appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs (+18 more)

### Community 51 - "manager-structured-memory.ts"
Cohesion: 0.09
Nodes (25): isMissing(), ManagerStructuredMemoryStoreOptions, openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS, MANAGER_STRUCTURED_MEMORY_MAX_KEY_CHARS (+17 more)

### Community 52 - "SessionOrderStore"
Cohesion: 0.15
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 53 - "manager-store.ts"
Cohesion: 0.14
Nodes (16): ManagerAgentOptions, TurnContextInput, JournalRecorder, JournalRecorderOptions, Seen, sessionTask(), JournalDraft, JournalEntry (+8 more)

### Community 54 - "terminal-session.test.ts"
Cohesion: 0.09
Nodes (23): composerHoldsOtherText(), composerTookPaste(), occurrences(), paneEvidenceCount(), paneShowsText(), pasteCouldCollapse(), pastedPlaceholderCount(), qualifyingPasteCount() (+15 more)

### Community 55 - "background-task-adapter.ts"
Cohesion: 0.10
Nodes (25): BackgroundTaskEventOptions, CopilotClientTaskInfo, CopilotClientTaskProgress, CopilotTaskInfo, CopilotTaskProgress, isBackgroundTaskInfo(), isBackgroundTaskProgress(), isLiveTaskStatus() (+17 more)

### Community 56 - "settings-profile-store.ts"
Cohesion: 0.13
Nodes (17): directories, fakeManager(), hub(), local, profileStore(), SettingsProfileState, SettingsProfileStore, directories (+9 more)

### Community 57 - "shared/settings-profile.ts"
Cohesion: 0.11
Nodes (26): AccentSetting, appearanceSettings, isRecord(), isSettingsRevision(), NewSessionFoldersSetting, NewSessionRuntimesSetting, oneOf(), oracleResponseStyles (+18 more)

### Community 58 - "session-patch-browser.ts"
Cohesion: 0.13
Nodes (25): advance(), Connection, connections, content(), FrameMeasurement, lastHeading(), message(), percentile() (+17 more)

### Community 59 - "KnowledgeStore"
Cohesion: 0.16
Nodes (8): WorkspaceFixtureState, KnowledgeRootReservation, KnowledgeState, KnowledgeStore, directories, fixture(), createHub(), KnowledgeRoot

### Community 60 - "backgroundTasksFromEvents"
Cohesion: 0.19
Nodes (27): addActivity(), backgroundTasksFromEvents(), boundedText(), errorValue(), eventString(), eventTask(), executionModeValue(), lastForegroundCompletionAt() (+19 more)

### Community 61 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 62 - "ManagerStore"
Cohesion: 0.13
Nodes (4): openStore(), emptyState(), ManagerStore, open()

### Community 63 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 64 - "ManagerStructuredMemoryStore"
Cohesion: 0.14
Nodes (10): benchmarkState(), now(), openFixture(), searchSamples(), ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryRecoveryError, ManagerStructuredMemoryStore, open() (+2 more)

### Community 65 - "manager-structured-memory-search.ts"
Cohesion: 0.14
Nodes (22): authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord(), ManagerStructuredMemoryFormattedContext (+14 more)

### Community 66 - "SettingsProfileClient"
Cohesion: 0.19
Nodes (5): sameSettingValue(), errorText(), isRefusal(), samePending(), SettingsProfileClient

### Community 67 - "workspace-fixtures.ts"
Cohesion: 0.12
Nodes (19): instrument(), open(), createWorkspaceFixtureState(), documents, FIXTURE_NOW, fixtureBackgroundTasks, fixtureEndpoints, fixtureKnowledgeListings (+11 more)

### Community 68 - "directory-browser.ts"
Cohesion: 0.17
Nodes (13): DirectoryScope, displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin() (+5 more)

### Community 69 - "ManagerAssistant.tsx"
Cohesion: 0.12
Nodes (15): ManagerSessionRef, ManagerStatus, cancelManager(), removeQueuedManagerMessage(), resetManager(), retryManagerMessage(), sendManagerMessage(), sessionLinkTarget() (+7 more)

### Community 70 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 71 - "ManagerMessage"
Cohesion: 0.14
Nodes (15): confirmationSchema, defaultsSchema, editSchema, effort, managerInputError(), ManagerRouteAgent, messageParams, registerManagerRoutes() (+7 more)

### Community 72 - "manager-context.ts"
Cohesion: 0.17
Nodes (17): ago(), attentionRank(), buildTurnContext(), changeLines(), clock(), MANAGER_STRUCTURED_MEMORY_SYSTEM_PROMPT, MANAGER_SYSTEM_PROMPT, managerPrompt() (+9 more)

### Community 73 - "ManagerAssistant"
Cohesion: 0.13
Nodes (20): editQueuedManagerMessage(), resolveManagerConfirmation(), phoneEnterCreatesNewline(), applyEvent(), canTakeFocus(), ManagerAssistant(), act(), announce() (+12 more)

### Community 74 - "capture-workspace.ts"
Cohesion: 0.19
Nodes (21): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+13 more)

### Community 75 - "session-clear-transcript.test.ts"
Cohesion: 0.11
Nodes (9): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions, disk, fixtures, gate(), holdTurnWrite() (+1 more)

### Community 76 - "session-reply-durability.test.ts"
Cohesion: 0.15
Nodes (18): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRunFixture() (+10 more)

### Community 77 - ".handleSessionEvent"
Cohesion: 0.26
Nodes (17): activityKind(), activityResult(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), isBackgroundTaskEvent(), isUnsupportedBackgroundTaskError() (+9 more)

### Community 78 - "use-oracle-settings.ts"
Cohesion: 0.16
Nodes (13): RuntimeModelOption, getManager(), updateManagerSettings(), effortFrom(), efforts, OracleModelSettings(), OracleSettingsStatus(), HarnessProps (+5 more)

### Community 79 - "startup-phases.test.ts"
Cohesion: 0.12
Nodes (12): phases, port, createStartupPhases(), startManagedServer(), StartupPhaseEvent, StartupPhaseRecord, address, directories (+4 more)

### Community 80 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (10): claude(), clearFixture(), copilot(), disk, event(), fixture(), fixtures, releases (+2 more)

### Community 81 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (19): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+11 more)

### Community 82 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 83 - ".correct"
Cohesion: 0.24
Nodes (8): digest(), ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryReferenceError, validateStructuredMemoryCorrect(), ManagerStructuredMemoryCorrectInput, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryRememberInput, ManagerStructuredMemoryState

### Community 84 - "knowledge-tree.ts"
Cohesion: 0.18
Nodes (17): WorkspaceEntry, knowledgeTreeKeyDown(), toggleKnowledgeFolder(), collapseKnowledgeFolder(), expandKnowledgeFolder(), knowledgeAncestors(), KnowledgeCrumb, knowledgeCrumbs() (+9 more)

### Community 85 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 86 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 87 - "agent-service.test.ts"
Cohesion: 0.15
Nodes (10): terminalFormSteps(), configurableModel(), directories, FakeCopilotClient, probeService(), services, startupFifoFixture(), terminalService() (+2 more)

### Community 89 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 90 - "session-knowledge-store.ts"
Cohesion: 0.12
Nodes (18): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+10 more)

### Community 91 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 92 - "ComputerSummary"
Cohesion: 0.18
Nodes (5): fixture(), session(), sessionAtLeastAsNew(), FakeManager, ComputerSummary

### Community 93 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 94 - "background-task-stop.test.ts"
Cohesion: 0.21
Nodes (13): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), snapshot() (+5 more)

### Community 95 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 97 - "server/session-patches.ts"
Cohesion: 0.22
Nodes (7): diffMessages(), Publication, sameMessage(), sessionKey(), SessionPublications, SessionUpserted, SessionMessagesPatch

### Community 98 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 99 - "NewSessionDialog"
Cohesion: 0.20
Nodes (16): activateSession(), createSession(), listDirectories(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), moveSessionToBrowsedFolder(), reopenInterruptedSession() (+8 more)

### Community 100 - "capture"
Cohesion: 0.18
Nodes (15): releaseRecording(), shortcutKeys(), startRecording(), stopRecording(), binding(), bindingLabel(), capturableCode(), isModifierCode() (+7 more)

### Community 101 - "check-workspace-review-regressions.ts"
Cohesion: 0.14
Nodes (12): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+4 more)

### Community 102 - "terminal-form-deadline.test.ts"
Cohesion: 0.16
Nodes (11): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+3 more)

### Community 103 - ".withFormViewport"
Cohesion: 0.23
Nodes (11): FormReplyDeadlineError, hasClippedTerminalFormTabs(), parseTerminalFormActiveField(), submitTerminalForm(), tabNames(), terminalBoxWrap(), terminalFormQuestionEnd(), terminalFormShowsFields() (+3 more)

### Community 104 - "capture-workbench-review.ts"
Cohesion: 0.15
Nodes (11): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, fixtureSessions (+3 more)

### Community 105 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 106 - "registerSessionKnowledgeRoutes"
Cohesion: 0.30
Nodes (11): registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession(), recordReplacement() (+3 more)

### Community 107 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 108 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 109 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 111 - ".startAdmitted"
Cohesion: 0.28
Nodes (3): restart(), httpBoundary(), StartupPhases

### Community 112 - "promotion-monitor.test.ts"
Cohesion: 0.27
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 113 - "session-response-order.ts"
Cohesion: 0.27
Nodes (11): sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), currentSessionEventSequence(), nextSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences (+3 more)

### Community 114 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+4 more)

### Community 115 - "background-task-tracker.ts"
Cohesion: 0.30
Nodes (6): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

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

### Community 120 - "server/side-question.ts"
Cohesion: 0.27
Nodes (8): SIDE_QUESTION_CLEANUP_MS, SIDE_QUESTION_RUNTIME_IDLE_MS, SIDE_QUESTION_TIMEOUT_MS, sideQuestionBoundary(), sideQuestionPrompt(), SIDE_QUESTION_EARLIER_ANSWER_MAX_LENGTH, SIDE_QUESTION_EARLIER_LIMIT, SIDE_QUESTION_MAX_LENGTH

### Community 121 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 123 - ".persist"
Cohesion: 0.24
Nodes (3): SessionKnowledgePersistenceError, SessionKnowledgeRecoveryError, stateWithPaths()

### Community 124 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 125 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 126 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 127 - "session-knowledge-store.test.ts"
Cohesion: 0.25
Nodes (6): SessionKnowledgeConflictError, disk, fixture(), fixtures, releases, root()

### Community 128 - "session-resource-transport.ts"
Cohesion: 0.36
Nodes (7): readClaudeMcp(), readCopilotResource(), copilotTransport(), disposals, Frame, write(), unavailable()

### Community 129 - "settings-profile.test.ts"
Cohesion: 0.25
Nodes (4): resolveAppearance(), settingsProfileCacheKey, cached(), MemoryStorage

### Community 130 - "voice-recorder.ts"
Cohesion: 0.28
Nodes (3): recordingDuration(), FakeRecorder, useVoiceRecorder()

### Community 131 - "KnowledgePosition"
Cohesion: 0.36
Nodes (4): WorkspaceFixtureOptions, KnowledgePosition, KnowledgeRestoreState, base

### Community 132 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, packageManager, private, type, version

### Community 133 - "backgroundHandoff"
Cohesion: 0.32
Nodes (8): attachmentModeValue(), backgroundHandoff(), booleanValue(), rawTailText(), shellIdFromFooter(), shellStopAcknowledged(), shellTaskMode(), toolTelemetryProperties()

### Community 134 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 135 - "requestVoid"
Cohesion: 0.32
Nodes (8): addComputer(), deleteKnowledgeRoot(), removeComputer(), requestVoid(), removeRoot(), ComputersDialog(), remove(), submit()

### Community 136 - "render-workspace-gifs.ts"
Cohesion: 0.29
Nodes (6): directory, { values }, workflows, pnpm, onlyBuiltDependencies, ffmpeg-static

### Community 137 - "history-projection.test.ts"
Cohesion: 0.33
Nodes (5): eventsFor(), ModelMessage, random(), seedOffset, terminalTypes

### Community 138 - "settings-profile-routes.ts"
Cohesion: 0.33
Nodes (6): deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, SETTINGS_DEVICE_ID_MAX_LENGTH

### Community 139 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 141 - "toolActivityContent"
Cohesion: 0.40
Nodes (6): previewText(), readableMcpServerName(), readableToolName(), sameToolLabel(), stripAnsi(), toolActivityContent()

### Community 142 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 143 - "usePanelWidth"
Cohesion: 0.47
Nodes (6): boundWidth(), readWidth(), storeWidth(), usePanelWidth(), commit(), finish()

### Community 150 - "MermaidDiagram.tsx"
Cohesion: 0.67
Nodes (3): drawDiagram(), drawing, MermaidDiagram()

## Knowledge Gaps
- **856 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+851 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1317 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **26 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ClaudeAgentService` connect `SessionDetail` to `directory-browser.ts`, `SessionService`, `SessionStore`, `session-resources.ts`, `CopilotSessionLike`, `use-oracle-settings.ts`, `.startAdmitted`, `claude-agent-service.ts`, `session-resource-clear.test.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionService` connect `SessionService` to `directory-browser.ts`, `computer-manager.ts`, `session-resources.ts`, `.startAdmitted`, `claude-agent-service.ts`, `ProviderSessionService`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionStore` to `AgentService`, `session-store.ts`, `SessionDetail`, `session-resources.ts`, `TerminalSessionController`, `session-resource-clear.test.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `App()` (e.g. with `createSettingsProfileClient()` and `prefersLightNow()`) actually correct?**
  _`App()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _856 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.04126707352513804 - nodes in this community are weakly interconnected._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.03265339030879626 - nodes in this community are weakly interconnected._
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
