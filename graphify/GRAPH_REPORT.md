# Agentic Remote - Graphify code map

Snapshot: `6f5169e8ee0178e2a59eba90afefb8b49b672670144f51995c101aa422b18bf1`

Source checkout: `0177cd3a16cd686e38bf65fa68f72bb108bebe47`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 303 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 303 files · ~608,688 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 4673 nodes · 13173 edges · 159 communities (133 shown, 11 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 865 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- api.ts
- App
- App.tsx
- AgentService
- session-store.ts
- ClaudeAgentService
- registerHubRoutes
- SessionDetail
- contracts.ts
- RemoteNodeClient
- ManagerAssistant.tsx
- terminal-session.ts
- agentic-remote-promotion-monitor
- ManagerAgent
- PushNotificationService
- BackgroundTaskSnapshot
- CopilotSessionLike
- session-resources.ts
- manager-agent.ts
- manager-structured-memory-validation.ts
- manager-tools.ts
- agent-service.ts
- TmuxTerminalSessionController
- markdown-navigation.ts
- .get
- ManagedSession
- manager-context.ts
- dependencies
- pwa.ts
- bundle
- TerminalSessionController
- registerNodeRoutes
- FakeSessionService
- app.ts
- terminal-startup-queue.test.ts
- active-sessions.ts
- lib.rs
- .clearSerialized
- shell.ts
- SessionKnowledgeStore
- multi-node.test.ts
- agentic-remote-promotion-setup
- config.rs
- background-task-adapter.ts
- hub-routes.ts
- ProviderSessionService
- devDependencies
- agentic-remote
- knowledge-tree.ts
- shared/settings-profile.ts
- manager-structured-memory.ts
- SessionOrderStore
- ManagerStore
- SettingsProfileClient
- session-patch-browser.ts
- cli-canary.ts
- startup-phases.test.ts
- src/settings-profile.ts
- scripts
- directory-browser.ts
- KnowledgeStore
- ManagerStructuredMemoryStore
- manager-structured-memory-search.ts
- noTmuxServer
- ManagerMessage
- .sendInternal
- compilerOptions
- ChatMessage
- transcription-service.ts
- .handleSessionEvent
- settings-profile-store.ts
- agent-service.test.ts
- session-reply-durability.test.ts
- session-store-providers.test.ts
- isTerminalComposerFooter
- capture-workspace.ts
- session-knowledge-store.ts
- terminal-session.test.ts
- PromptCards.tsx
- compilerOptions
- normalizeKnowledgeRelativePath
- compilerOptions
- compilerOptions
- event-log.ts
- .correct
- workspace-browser.ts
- terminal-form-deadline.test.ts
- delegated-transcription-service.test.ts
- ManagerMemory
- session-latency-benchmark.ts
- session-clear-transcript.test.ts
- ReaderWorkspace
- workspace-fixtures.ts
- background-task-stop.test.ts
- recovery-resend-durability.test.ts
- server/session-patches.ts
- use-oracle-settings.ts
- check-workspace-review-regressions.ts
- package.json
- delegated-transcription-service.ts
- desktop.json
- eventString
- registerSessionKnowledgeRoutes
- session-resource-clear.test.ts
- SettingsProfileStore
- theme-contrast.test.ts
- use-session-knowledge-root.ts
- BackgroundTasksDialog.tsx
- capture-workbench-review.ts
- .oxlintrc.json
- settings-local.json
- promotion-monitor.test.ts
- TranscriptionError
- scripts
- background-task-tracker.ts
- recovery-seed-guards.test.ts
- html-preview.ts
- session-knowledge-routes.ts
- session-resource-transport.ts
- server/side-question.ts
- setupWorkspaceFixture
- generate-pwa-icons.ts
- DeferredSession
- bridge.rs
- screenshot-stability.test.ts
- KnowledgePosition
- promotion-setup-execution.test.ts
- recordValue
- release-publication.test.ts
- history-projection.test.ts
- recovery-context.ts
- settings-profile-routes.ts
- settings.ts
- SlashCommand
- composer-layout.test.ts
- removeComputer
- terminal-send-uncertainty.test.ts
- version-policy.test.ts
- MermaidDiagram.test.tsx
- tsconfig.json
- vite.config.ts
- sw.js
- recovery-question-styles.test.ts
- agentic-remote-shell

## God Nodes (most connected - your core abstractions)
1. `SessionDetail` - 287 edges
2. `App()` - 265 edges
3. `AgentService` - 255 edges
4. `SessionStore` - 168 edges
5. `ClaudeAgentService` - 120 edges
6. `ManagedSession` - 97 edges
7. `registerHubRoutes()` - 89 edges
8. `ComputerManager` - 85 edges
9. `ManagerAgent` - 72 edges
10. `SessionService` - 72 edges

## Surprising Connections (you probably didn't know these)
- `composerKeyDown()` --indirect_call--> `composer()`  [INFERRED]
  src/App.tsx → server/terminal-send-uncertainty.test.ts
- `AcceptedSdkReply` --references--> `SessionDetail`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `CreationRuntime` --references--> `RuntimeReasoningEffort`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `BackgroundTaskUpdate` --references--> `BackgroundTaskSnapshot`  [EXTRACTED]
  server/background-task-tracker.ts → shared/contracts.ts
- `PendingClaudeReply` --references--> `SessionDetail`  [EXTRACTED]
  server/claude-agent-service.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (159 total, 11 thin omitted)

### Community 0 - "api.ts"
Cohesion: 0.02
Nodes (148): provider(), ManagedSessionMcpServersSnapshot, ManagedSessionSkillsSnapshot, SessionMcpServerSummary, SessionResourceSource, SessionSkillSummary, ResolveManagerConfirmationInput, SendManagerMessageInput (+140 more)

### Community 1 - "App"
Cohesion: 0.04
Nodes (134): readKnowledgeFile(), activeComposerPastes(), App(), adoptConversationReplacement(), appendComposerForKey(), appKeyDown(), applyComputerSnapshot(), applySession() (+126 more)

### Community 2 - "App.tsx"
Cohesion: 0.02
Nodes (118): isManagerEvent(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph() (+110 more)

### Community 3 - "AgentService"
Cohesion: 0.04
Nodes (8): AgentService, RuntimeConfigurationError, statusFromEvents(), fixture(), TranscriptObservation, isTerminalAgentWorking(), isTerminalVisiblyIdle(), hasRunningBackgroundAgent()

### Community 4 - "session-store.ts"
Cohesion: 0.02
Nodes (88): fixture(), holdProbe(), fixtures, gate(), releases, restart(), directories, fakeClient() (+80 more)

### Community 5 - "ClaudeAgentService"
Cohesion: 0.04
Nodes (24): ClaudeAgentService, isMissingClaudeSessionError(), cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle() (+16 more)

### Community 6 - "registerHubRoutes"
Cohesion: 0.05
Nodes (16): ComputerManager, managedSession(), sessionAtLeastAsNew(), RegisteredComputer, registerHubRoutes(), SessionMuteCarrier, ResourceRead, SessionService (+8 more)

### Community 7 - "SessionDetail"
Cohesion: 0.07
Nodes (12): fixture(), observe(), clearRecoverySeedFailure(), cloneSession(), grantTerminalRecovery(), ownsRecoverySeedFailure(), SessionReplacementCleanupError, SessionStore (+4 more)

### Community 8 - "contracts.ts"
Cohesion: 0.04
Nodes (51): AgentServiceEvents, AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput (+43 more)

### Community 9 - "RemoteNodeClient"
Cohesion: 0.04
Nodes (25): AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, DEFINITE_DISPATCH_REFUSALS, normalizeNodeUrl(), REDIRECT_STATUSES, RemoteNodeClient, client(), servers (+17 more)

### Community 10 - "ManagerAssistant.tsx"
Cohesion: 0.05
Nodes (51): react, ManagerSessionRef, ManagerSnapshot, cancelManager(), editQueuedManagerMessage(), getManager(), removeQueuedManagerMessage(), resetManager() (+43 more)

### Community 11 - "terminal-session.ts"
Cohesion: 0.07
Nodes (67): activeBottomFrame(), cleanDialogLine(), clearAutomaticStartupPrompts(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFocusWitnessed(), containsCopiedInteractiveFrame(), desktopInstallPromptIdentity() (+59 more)

### Community 12 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (71): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+63 more)

### Community 13 - "ManagerAgent"
Cohesion: 0.08
Nodes (11): checkContent(), delay(), errorMessage(), isNotFound(), ManagerAgent, sameRuntime(), capturePrompt(), TurnError (+3 more)

### Community 14 - "PushNotificationService"
Cohesion: 0.07
Nodes (29): brief(), HubEventSource, OracleEventSource, PushNotificationService, PushPolicy, PushSender, PushState, directories (+21 more)

### Community 15 - "BackgroundTaskSnapshot"
Cohesion: 0.06
Nodes (54): hasActiveBackgroundTasks(), BackgroundTaskSnapshot, SessionExecutionMode, saveSessionOrderLane(), handleDragEnd(), KnowledgeRootSelector(), root, reorderSessionLaneWithHiddenFollowers() (+46 more)

### Community 16 - "CopilotSessionLike"
Cohesion: 0.06
Nodes (32): CopilotSessionLike, CopilotTasksApi, acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight() (+24 more)

### Community 17 - "session-resources.ts"
Cohesion: 0.09
Nodes (45): ActiveClaudeQuery, releases, session, snapshot, claudeMcp(), claudeSkillNames(), copilotMcp, copilotSkills (+37 more)

### Community 18 - "manager-agent.ts"
Cohesion: 0.06
Nodes (35): ManagerEventSource, discover(), isPending(), isQueued(), ManagerAgentOptions, ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession (+27 more)

### Community 19 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 20 - "manager-tools.ts"
Cohesion: 0.07
Nodes (30): APPROVE_WORDS, computerField, createManagerTools(), define(), deliver(), requireComputer(), resolveSession(), structuredTools() (+22 more)

### Community 21 - "agent-service.ts"
Cohesion: 0.05
Nodes (50): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityResult(), ActivityToolStart, ansiSequence, commandShortcut() (+42 more)

### Community 22 - "TmuxTerminalSessionController"
Cohesion: 0.09
Nodes (19): copilotCommand(), endProbeSession(), execFileAsync, parseTerminalUpdateNotice(), processAncestors(), processCommand(), processIsAlive(), safeWindowName() (+11 more)

### Community 23 - "markdown-navigation.ts"
Cohesion: 0.07
Nodes (41): executeCommand(), ChangeDirectoryDialog(), submit(), followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), MarkdownImage(), missingDocumentFragment() (+33 more)

### Community 24 - ".get"
Cohesion: 0.10
Nodes (5): terminalAnswerRefused(), preparePrompt(), queueConflict(), QueuedPromptReservation, SubmissionError

### Community 25 - "ManagedSession"
Cohesion: 0.06
Nodes (25): ComputerManagerEvents, RemoteResync, RemoteSessionListing, RemoteSessionRead, SessionMetadataLookup, ManagerHub, disk, FakeManager (+17 more)

### Community 26 - "manager-context.ts"
Cohesion: 0.09
Nodes (32): ago(), attentionRank(), buildTurnContext(), changeLines(), clock(), MANAGER_STRUCTURED_MEMORY_SYSTEM_PROMPT, MANAGER_SYSTEM_PROMPT, managerPrompt() (+24 more)

### Community 27 - "dependencies"
Cohesion: 0.04
Nodes (47): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/static, @fastify/websocket (+39 more)

### Community 28 - "pwa.ts"
Cohesion: 0.09
Nodes (39): directories, AppVersion, parseAppVersion(), deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart() (+31 more)

### Community 29 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 30 - "TerminalSessionController"
Cohesion: 0.10
Nodes (8): isUncertainDelivery(), persistedFormAnswer(), TerminalFormContinuation, TerminalFormReplyError, TerminalSessionController, PendingUserInput, UserInputReplyInput, deliveryUncertaintyFromError()

### Community 31 - "registerNodeRoutes"
Cohesion: 0.06
Nodes (30): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile(), configureRuntimeSchema, createSessionSchema (+22 more)

### Community 32 - "FakeSessionService"
Cohesion: 0.07
Nodes (3): FakeSessionService, ConfigureRuntimeInput, SideQuestionExchange

### Community 33 - "app.ts"
Cohesion: 0.08
Nodes (22): prefixes, session, trusted, untrusted, buildApp(), errorStatusCode(), isAppleTouchIconProbe(), ServerRole (+14 more)

### Community 34 - "terminal-startup-queue.test.ts"
Cohesion: 0.11
Nodes (35): exec, formFixture(), horizontalFormFixture(), textFieldFormFixture(), directories, exec, client(), disk (+27 more)

### Community 35 - "active-sessions.ts"
Cohesion: 0.10
Nodes (37): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+29 more)

### Community 36 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 37 - ".clearSerialized"
Cohesion: 0.09
Nodes (6): agentMode(), CopilotClientLike, isMissingSessionError(), removeCopilotSessionFiles(), SideQuestionError, withSideQuestionTimeout()

### Community 38 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 39 - "SessionKnowledgeStore"
Cohesion: 0.11
Nodes (14): WorkspaceFixtureState, bindingKey(), SessionKnowledgeConflictError, SessionKnowledgeEvents, SessionKnowledgeRecoveryError, SessionKnowledgeStore, disk, fixture() (+6 more)

### Community 40 - "multi-node.test.ts"
Cohesion: 0.08
Nodes (15): fixture(), managers, releases, remote, session(), ComputerRegistry, RegistryState, directories (+7 more)

### Community 41 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 42 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 43 - "background-task-adapter.ts"
Cohesion: 0.13
Nodes (35): addActivity(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), boundedText(), CopilotClientTaskInfo, CopilotClientTaskProgress, eventTask(), executionModeValue() (+27 more)

### Community 44 - "hub-routes.ts"
Cohesion: 0.06
Nodes (36): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+28 more)

### Community 46 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 47 - "agentic-remote"
Cohesion: 0.13
Nodes (31): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+23 more)

### Community 48 - "knowledge-tree.ts"
Cohesion: 0.10
Nodes (31): WorkspaceEntry, listKnowledgeEntries(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeTreeKeyDown(), loadKnowledgeChain() (+23 more)

### Community 49 - "shared/settings-profile.ts"
Cohesion: 0.09
Nodes (32): AccentSetting, appearanceSettings, applySettingsChanges(), isRecord(), isSettingsRevision(), NewSessionFoldersSetting, NewSessionRuntime, NewSessionRuntimesSetting (+24 more)

### Community 50 - "manager-structured-memory.ts"
Cohesion: 0.09
Nodes (25): isMissing(), ManagerStructuredMemoryStoreOptions, openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS, MANAGER_STRUCTURED_MEMORY_MAX_KEY_CHARS (+17 more)

### Community 51 - "SessionOrderStore"
Cohesion: 0.15
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 52 - "ManagerStore"
Cohesion: 0.12
Nodes (4): openStore(), emptyState(), ManagerStore, open()

### Community 53 - "SettingsProfileClient"
Cohesion: 0.18
Nodes (5): SettingsProfileSnapshot, errorText(), isRefusal(), SettingsProfileClient, SettingsProfileTransport

### Community 54 - "session-patch-browser.ts"
Cohesion: 0.14
Nodes (25): advance(), connections, content(), FrameMeasurement, instrument(), lastHeading(), message(), open() (+17 more)

### Community 55 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 56 - "startup-phases.test.ts"
Cohesion: 0.10
Nodes (13): phases, port, createStartupPhases(), startManagedServer(), StartupPhaseEvent, StartupPhaseRecord, StartupPhases, address (+5 more)

### Community 57 - "src/settings-profile.ts"
Cohesion: 0.11
Nodes (21): AppearanceSetting, SETTINGS_MAX_COMPUTERS, SettingsChange, SettingsProfileKey, SettingsProfileValues, SettingsUpdateResult, Appearance, appearanceFrom() (+13 more)

### Community 58 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 59 - "directory-browser.ts"
Cohesion: 0.17
Nodes (13): DirectoryScope, displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin() (+5 more)

### Community 60 - "KnowledgeStore"
Cohesion: 0.17
Nodes (7): KnowledgeRootReservation, KnowledgeState, KnowledgeStore, directories, fixture(), createHub(), KnowledgeRoot

### Community 61 - "ManagerStructuredMemoryStore"
Cohesion: 0.14
Nodes (11): benchmarkState(), now(), openFixture(), searchSamples(), ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryRecoveryError, ManagerStructuredMemoryStore, open() (+3 more)

### Community 62 - "manager-structured-memory-search.ts"
Cohesion: 0.14
Nodes (22): authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord(), ManagerStructuredMemoryFormattedContext (+14 more)

### Community 63 - "noTmuxServer"
Cohesion: 0.11
Nodes (16): listTmuxSessions(), noTmuxServer(), processGone(), procVisible(), socketIdentity(), directories, { execute }, files (+8 more)

### Community 64 - "ManagerMessage"
Cohesion: 0.13
Nodes (15): confirmationSchema, defaultsSchema, editSchema, effort, managerInputError(), ManagerRouteAgent, messageParams, registerManagerRoutes() (+7 more)

### Community 65 - ".sendInternal"
Cohesion: 0.15
Nodes (17): capturePane(), composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), isTerminalLoading(), isTerminalOverlay(), isTerminalSessionInUsePrompt() (+9 more)

### Community 66 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 67 - "ChatMessage"
Cohesion: 0.15
Nodes (11): Connection, Client, PatchSocket, Browser, seedOffset, StoredSession, ChatMessage, HubResyncRequest (+3 more)

### Community 68 - "transcription-service.ts"
Cohesion: 0.11
Nodes (19): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+11 more)

### Community 69 - ".handleSessionEvent"
Cohesion: 0.21
Nodes (19): activityKind(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), isBackgroundTaskEvent(), isRuntimeReasoningEffort(), isUnsupportedBackgroundTaskError() (+11 more)

### Community 70 - "settings-profile-store.ts"
Cohesion: 0.15
Nodes (11): SettingsProfileState, applySettingsImport(), isSettingsProfileKey(), SettingsProfileRecord, validateSettingsImport(), seedHubSettings(), resolveAppearance(), settingsProfileCacheKey (+3 more)

### Community 71 - "agent-service.test.ts"
Cohesion: 0.13
Nodes (13): terminalFormSteps(), configurableModel(), directories, FakeCopilotClient, probeService(), services, startupFifoFixture(), terminalService() (+5 more)

### Community 72 - "session-reply-durability.test.ts"
Cohesion: 0.15
Nodes (18): answer(), assistantFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRequest(), copilotRunFixture() (+10 more)

### Community 73 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (11): claude(), clearFixture(), copilot(), disk, event(), fixture(), fixtures, holdOtherWrite() (+3 more)

### Community 74 - "isTerminalComposerFooter"
Cohesion: 0.13
Nodes (20): boxedComposerFrame(), captureTerminal(), composerFrameText(), composerHasFocus(), composerRowText(), cursorComposerFrame(), DownloadedUpdateCell, downloadedUpdateFooterBlock() (+12 more)

### Community 75 - "capture-workspace.ts"
Cohesion: 0.20
Nodes (20): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+12 more)

### Community 76 - "session-knowledge-store.ts"
Cohesion: 0.10
Nodes (19): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+11 more)

### Community 77 - "terminal-session.test.ts"
Cohesion: 0.10
Nodes (15): terminalChecklistState(), terminalFormCommitKeys(), bracketedTabPane, desktopInstallPane, directories, downloadedUpdateFooter, folderTrustPane, formPaneFirstField (+7 more)

### Community 78 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (19): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+11 more)

### Community 79 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 80 - "normalizeKnowledgeRelativePath"
Cohesion: 0.21
Nodes (16): knowledgeRelativePathSchema, joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath(), slashPath(), scopedKnowledgeRoot() (+8 more)

### Community 81 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 82 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 83 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 84 - ".correct"
Cohesion: 0.26
Nodes (7): digest(), ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryCorrectInput, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryRememberInput, ManagerStructuredMemoryState

### Community 85 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 86 - "terminal-form-deadline.test.ts"
Cohesion: 0.13
Nodes (13): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+5 more)

### Community 87 - "delegated-transcription-service.test.ts"
Cohesion: 0.15
Nodes (8): BuildAppOptions, hubComputer, workstation, registerTranscriptionRoutes(), transcriptionMultipartOptions, AudioUpload, MAX_AUDIO_BYTES, TranscriptionService

### Community 88 - "ManagerMemory"
Cohesion: 0.22
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 89 - "session-latency-benchmark.ts"
Cohesion: 0.24
Nodes (16): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+8 more)

### Community 90 - "session-clear-transcript.test.ts"
Cohesion: 0.14
Nodes (6): SessionAdmissions, disk, fixtures, gate(), holdTurnWrite(), releases

### Community 91 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 92 - "workspace-fixtures.ts"
Cohesion: 0.16
Nodes (14): CONTEXT_EXAMPLE, documents, FIXTURE_NOW, fixtureBackgroundTasks, fixtureEndpoints, fixtureKnowledgeListings, fixtureKnowledgePositions, fixtureKnowledgeRoots (+6 more)

### Community 93 - "background-task-stop.test.ts"
Cohesion: 0.21
Nodes (13): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), snapshot() (+5 more)

### Community 94 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 95 - "server/session-patches.ts"
Cohesion: 0.22
Nodes (7): diffMessages(), Publication, sameMessage(), sessionKey(), SessionPublications, SessionUpserted, SessionMessagesPatch

### Community 96 - "use-oracle-settings.ts"
Cohesion: 0.21
Nodes (11): updateManagerSettings(), effortFrom(), efforts, OracleModelSettings(), OracleSettingsStatus(), HarnessProps, models, OracleSettings() (+3 more)

### Community 97 - "check-workspace-review-regressions.ts"
Cohesion: 0.14
Nodes (12): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+4 more)

### Community 98 - "package.json"
Cohesion: 0.13
Nodes (13): directory, { values }, workflows, engines, node, name, packageManager, pnpm (+5 more)

### Community 99 - "delegated-transcription-service.ts"
Cohesion: 0.18
Nodes (9): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), transcriptionComputerName(), headerSafe(), supportsAudioUpload() (+1 more)

### Community 100 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 101 - "eventString"
Cohesion: 0.20
Nodes (14): attachmentModeValue(), backgroundHandoff(), booleanValue(), eventString(), lastForegroundCompletionAt(), normalizedToolName(), rawTailText(), shellIdFromFooter() (+6 more)

### Community 102 - "registerSessionKnowledgeRoutes"
Cohesion: 0.30
Nodes (11): registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession(), recordReplacement() (+3 more)

### Community 103 - "session-resource-clear.test.ts"
Cohesion: 0.19
Nodes (13): apps, directories, directory(), obstructUploads(), pairedFixture(), providerFixture(), providers, seed() (+5 more)

### Community 104 - "SettingsProfileStore"
Cohesion: 0.23
Nodes (5): profileStore(), SettingsProfileStore, directories, store(), isSettingsDeviceId()

### Community 105 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 106 - "use-session-knowledge-root.ts"
Cohesion: 0.23
Nodes (10): getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), updateSessionKnowledgeRoot(), bindingKey(), knowledgePositionForBinding(), SessionIdentity, first, root (+2 more)

### Community 107 - "BackgroundTasksDialog.tsx"
Cohesion: 0.23
Nodes (10): DialogFrame(), BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive() (+2 more)

### Community 108 - "capture-workbench-review.ts"
Cohesion: 0.17
Nodes (10): frame(), geometry, output, scratch, screenshot(), { values }, fixtureSessions, IDLE_SESSION_ID (+2 more)

### Community 109 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 110 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 111 - "promotion-monitor.test.ts"
Cohesion: 0.27
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 112 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 113 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+4 more)

### Community 114 - "background-task-tracker.ts"
Cohesion: 0.30
Nodes (6): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 115 - "recovery-seed-guards.test.ts"
Cohesion: 0.18
Nodes (8): bootLegacy(), directories, execute, pending, releases, SeedState, services, stores

### Community 116 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 117 - "session-knowledge-routes.ts"
Cohesion: 0.18
Nodes (6): Lineage, RegistrationGeneration, ReplacementEvidence, SessionKnowledgeLifecycle, sessionParams, updateSchema

### Community 118 - "session-resource-transport.ts"
Cohesion: 0.27
Nodes (8): CopilotResourceClient, readClaudeMcp(), readCopilotResource(), copilotTransport(), disposals, Frame, write(), unavailable()

### Community 119 - "server/side-question.ts"
Cohesion: 0.27
Nodes (8): SIDE_QUESTION_CLEANUP_MS, SIDE_QUESTION_RUNTIME_IDLE_MS, SIDE_QUESTION_TIMEOUT_MS, sideQuestionBoundary(), sideQuestionPrompt(), SIDE_QUESTION_EARLIER_ANSWER_MAX_LENGTH, SIDE_QUESTION_EARLIER_LIMIT, SIDE_QUESTION_MAX_LENGTH

### Community 120 - "setupWorkspaceFixture"
Cohesion: 0.24
Nodes (6): pageFor(), createWorkspaceFixtureState(), fixtureBaseUrl(), fixtureValue(), setupWorkspaceFixture(), fixtureApi()

### Community 121 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 123 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 124 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 125 - "KnowledgePosition"
Cohesion: 0.33
Nodes (5): WorkspaceFixtureOptions, KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 126 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 127 - "recordValue"
Cohesion: 0.39
Nodes (8): errorValue(), notificationKind(), parsedValue(), recordValue(), shellTaskOutput(), taskInfoFromValue(), taskInfoListFromValue(), textFromValue()

### Community 128 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 129 - "history-projection.test.ts"
Cohesion: 0.33
Nodes (5): eventsFor(), ModelMessage, random(), seedOffset, terminalTypes

### Community 130 - "recovery-context.ts"
Cohesion: 0.38
Nodes (4): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief

### Community 131 - "settings-profile-routes.ts"
Cohesion: 0.33
Nodes (6): deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, SETTINGS_DEVICE_ID_MAX_LENGTH

### Community 132 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 134 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 135 - "removeComputer"
Cohesion: 0.60
Nodes (5): addComputer(), removeComputer(), ComputersDialog(), remove(), submit()

## Knowledge Gaps
- **852 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+847 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1310 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `session-store.ts`, `.clearSerialized`, `.handleSessionEvent`, `SessionDetail`, `contracts.ts`, `CopilotSessionLike`, `session-resources.ts`, `.get`, `directory-browser.ts`, `TerminalSessionController`, `registerNodeRoutes`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionService` connect `registerHubRoutes` to `FakeSessionService`, `SlashCommand`, `contracts.ts`, `RemoteNodeClient`, `session-resources.ts`, `startup-phases.test.ts`, `directory-browser.ts`, `registerNodeRoutes`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionDetail` to `AgentService`, `session-store.ts`, `ClaudeAgentService`, `.clearSerialized`, `.get`, `TerminalSessionController`, `registerNodeRoutes`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `App()` (e.g. with `createSettingsProfileClient()` and `prefersLightNow()`) actually correct?**
  _`App()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _852 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `api.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.02461038961038961 - nodes in this community are weakly interconnected._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.037101787101787104 - nodes in this community are weakly interconnected._
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
