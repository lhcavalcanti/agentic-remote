# Agentic Remote - Graphify code map

Snapshot: `73cc5923fa62b61b172d2f2daad2470676a7e49f4b8140805e3c38573b98645f`

Source checkout: `c06eb8c3f58201fee44236b64ceeb81861743e66`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 321 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 321 files · ~646,750 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 4905 nodes · 13801 edges · 176 communities (139 shown, 21 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 894 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- App
- api.ts
- App.tsx
- SessionDetail
- SessionStore
- contracts.ts
- CopilotClientLike
- claude-agent-service.ts
- agentic-remote-promotion-monitor
- sessionKey
- node-routes.ts
- ManagedSession
- PushNotificationService
- terminal-session.ts
- manager-tools.ts
- RemoteNodeClient
- manager-agent.ts
- ManagerAgent
- TmuxTerminalSessionController
- agent-service.ts
- active-sessions.ts
- session-store.ts
- markdown-navigation.ts
- ManagerStore
- workspace-fixtures.ts
- ManagerAssistant.tsx
- bundle
- manager-structured-memory-validation.ts
- ProviderSessionService
- session-resource-providers.test.ts
- terminal-startup-queue.test.ts
- pwa.ts
- app.ts
- SessionService
- shell.ts
- lib.rs
- cleanDialogLine
- agentic-remote-promotion-setup
- TerminalSessionController
- hub-routes.ts
- agentic-remote-gate
- config.rs
- FakeSessionService
- normalizeKnowledgeRelativePath
- dependencies
- devDependencies
- terminal-session.test.ts
- agentic-remote
- SessionKnowledgeStore
- recordValue
- background-task-adapter.ts
- backgroundTasksFromEvents
- SessionOrderStore
- shared/settings-profile.ts
- session-reply-durability.test.ts
- SessionStatus
- session-patch-browser.ts
- KnowledgeStore
- UserInputReplyInput
- cli-canary.ts
- delegated-transcription-service.ts
- manager-context.ts
- .toolHost
- send-matrix.integration.test.ts
- scripts
- HubEvent
- ManagerMessage
- manager-structured-memory-search.ts
- settings-profile-store.ts
- src/settings-profile.ts
- SettingsProfileClient
- transcription-service.ts
- compilerOptions
- manager-structured-memory.ts
- ManagerStructuredMemoryStore
- manager-structured-memory-store.ts
- capture-workspace.ts
- use-oracle-settings.ts
- startup-phases.test.ts
- session-clear-transcript.test.ts
- session-knowledge-store.ts
- session-resource-clear.test.ts
- PromptCards.tsx
- full-gate.test.ts
- compilerOptions
- submission-error.ts
- refusal-metrics.ts
- session-store-providers.test.ts
- knowledge-tree.ts
- compilerOptions
- compilerOptions
- server/side-question.ts
- directory-browser.ts
- session-resource-routes.test.ts
- event-log.ts
- ManagerMemory
- workspace-browser.ts
- terminal-form-deadline.test.ts
- react
- session-latency-benchmark.ts
- recovery-resend-durability.test.ts
- ReaderWorkspace
- promotion-monitor.test.ts
- server/session-patches.ts
- NewSessionDialog
- scripts
- background-task-stop.test.ts
- check-workspace-review-regressions.ts
- desktop.json
- registerSessionKnowledgeRoutes
- theme-contrast.test.ts
- BackgroundTasksDialog.tsx
- .oxlintrc.json
- settings-local.json
- background-task-tracker.ts
- TranscriptionError
- DeferredSession
- .initialize
- html-preview.ts
- copilot-sdk-client.ts
- session-knowledge-routes.ts
- settings-profile.test.ts
- node:fs/promises
- generate-pwa-icons.ts
- file-upload-routes.ts
- bridge.rs
- screenshot-stability.test.ts
- manager-structured-memory-performance.test.ts
- promotion-setup-execution.test.ts
- package.json
- agent-service.test.ts
- recovery-context.ts
- release-publication.test.ts
- render-workspace-gifs.ts
- history-projection.test.ts
- settings-profile-routes.ts
- SessionRuntimeInfo
- settings.ts
- .transport
- composer-layout.test.ts
- usePanelWidth
- MarkdownCodeBlock.tsx
- vite.config.ts
- hasActiveBackgroundTasks
- FakeRecorder
- terminal-send-uncertainty.test.ts
- MockMediaRecorder
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
2. `App()` - 273 edges
3. `AgentService` - 264 edges
4. `SessionStore` - 178 edges
5. `ClaudeAgentService` - 124 edges
6. `ManagedSession` - 98 edges
7. `registerHubRoutes()` - 91 edges
8. `ComputerManager` - 86 edges
9. `ManagerAgent` - 73 edges
10. `SessionService` - 73 edges

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

## Communities (176 total, 21 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.04
Nodes (10): agentMode(), AgentService, isUncertainDelivery(), removeCopilotSessionFiles(), RuntimeConfigurationError, terminalAnswerRefused(), queueConflict(), isRetainedRefusal() (+2 more)

### Community 1 - "App"
Cohesion: 0.03
Nodes (163): isManagerEvent(), alertNotification(), terminalSendOptions(), submissionReceiptFromError(), deleteKnowledgeRoot(), moveSessionToTmux(), readKnowledgeFile(), replyPermission() (+155 more)

### Community 2 - "api.ts"
Cohesion: 0.03
Nodes (123): ManagedSessionMcpServersSnapshot, ManagedSessionSkillsSnapshot, SessionMcpServerSummary, SessionResourceSource, SessionSkillSummary, SettingsChange, SettingsProfileKey, SettingsUpdateResult (+115 more)

### Community 3 - "App.tsx"
Cohesion: 0.03
Nodes (106): addComputer(), configureRuntime(), removeComputer(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation() (+98 more)

### Community 4 - "SessionDetail"
Cohesion: 0.05
Nodes (9): ClaudeAgentService, isMissingClaudeSessionError(), observe(), assertSessionNotRetained(), clearRecoverySeedFailure(), ownsRecoverySeedFailure(), QueuedPromptReservation, QueuedPrompt (+1 more)

### Community 5 - "SessionStore"
Cohesion: 0.04
Nodes (46): fixture(), holdProbe(), fixtures, gate(), releases, restart(), fixture(), connect() (+38 more)

### Community 6 - "contracts.ts"
Cohesion: 0.03
Nodes (59): ClaudeAgentServiceEvents, DirectoryScope, directories, routingFixture(), session(), temporaryDirectory(), AUDIO_TYPE_HEADER, ProviderSessionServiceEvents (+51 more)

### Community 7 - "CopilotClientLike"
Cohesion: 0.03
Nodes (40): CopilotClientLike, CopilotSessionLike, configurableModel(), FakeCopilotClient, probeService(), startupFifoFixture(), terminalService(), CopilotTasksApi (+32 more)

### Community 8 - "claude-agent-service.ts"
Cohesion: 0.06
Nodes (60): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission (+52 more)

### Community 9 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (77): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url(), CANARY (+69 more)

### Community 10 - "sessionKey"
Cohesion: 0.05
Nodes (66): saveSessionOrderLane(), askSideQuestion(), cancelSelectedBackgroundTask(), closeSideQuestion(), handleDragEnd(), openSessionResources(), openSideQuestion(), sideQuestionKeyDown() (+58 more)

### Community 11 - "node-routes.ts"
Cohesion: 0.03
Nodes (54): ServerRole, fixture(), managers, releases, remote, session(), SessionMetadataLookup, ComputerRegistry (+46 more)

### Community 12 - "ManagedSession"
Cohesion: 0.11
Nodes (10): ComputerManager, managedSession(), mapWithConcurrency(), sessionAtLeastAsNew(), RegisteredComputer, registerHubRoutes(), SessionMuteCarrier, ManagedRemovedQueuedPrompt (+2 more)

### Community 13 - "PushNotificationService"
Cohesion: 0.07
Nodes (28): brief(), HubEventSource, OracleEventSource, PushNotificationService, PushPolicy, PushSender, PushState, directories (+20 more)

### Community 14 - "terminal-session.ts"
Cohesion: 0.05
Nodes (61): boxedComposerFrame(), captureTerminal(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFrameText(), composerHasFocus(), composerRowText(), cursorComposerFrame() (+53 more)

### Community 15 - "manager-tools.ts"
Cohesion: 0.06
Nodes (33): APPROVE_WORDS, computerField, createManagerTools(), define(), deliver(), requireComputer(), resolveSession(), structuredTools() (+25 more)

### Community 16 - "RemoteNodeClient"
Cohesion: 0.05
Nodes (15): RemoteResync, RemoteSessionRead, headerSafe(), RemoteNodeClient, client(), servers, session, BackgroundTaskSnapshot (+7 more)

### Community 17 - "manager-agent.ts"
Cohesion: 0.06
Nodes (37): ManagerEventSource, discover(), isPending(), isQueued(), ManagerAgentOptions, ManagerSdkEvent, ManagerSdkSessionConfig, Rung (+29 more)

### Community 18 - "ManagerAgent"
Cohesion: 0.09
Nodes (11): checkContent(), delay(), errorMessage(), isNotFound(), ManagerAgent, ManagerSdkSession, sameRuntime(), TurnError (+3 more)

### Community 19 - "TmuxTerminalSessionController"
Cohesion: 0.09
Nodes (18): startAgentAfterClear(), capturePane(), composerHoldsText(), composerText(), copilotCommand(), endProbeSession(), execFileAsync, isTerminalAgentWorking() (+10 more)

### Community 20 - "agent-service.ts"
Cohesion: 0.04
Nodes (53): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), ActivityToolStart, AgentServiceEvents, ansiSequence, commandShortcut() (+45 more)

### Community 21 - "active-sessions.ts"
Cohesion: 0.07
Nodes (45): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+37 more)

### Community 22 - "session-store.ts"
Cohesion: 0.05
Nodes (38): directories, fakeClient(), ForkRequest, forkSession(), services, deferred(), disk, enqueue() (+30 more)

### Community 23 - "markdown-navigation.ts"
Cohesion: 0.08
Nodes (40): executeCommand(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), MarkdownImage() (+32 more)

### Community 24 - "ManagerStore"
Cohesion: 0.09
Nodes (13): openStore(), JournalRecorder, JournalRecorderOptions, sessionTask(), emptyState(), JournalDraft, JournalKind, ManagerStore (+5 more)

### Community 25 - "workspace-fixtures.ts"
Cohesion: 0.07
Nodes (33): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, createWorkspaceFixtureState() (+25 more)

### Community 26 - "ManagerAssistant.tsx"
Cohesion: 0.08
Nodes (33): cancelManager(), editQueuedManagerMessage(), removeQueuedManagerMessage(), resetManager(), resolveManagerConfirmation(), retryManagerMessage(), sendManagerMessage(), phoneEnterCreatesNewline() (+25 more)

### Community 27 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 28 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (41): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+33 more)

### Community 30 - "session-resource-providers.test.ts"
Cohesion: 0.07
Nodes (31): ClaudeSdk, cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle(), disk (+23 more)

### Community 31 - "terminal-startup-queue.test.ts"
Cohesion: 0.11
Nodes (36): exec, formFixture(), horizontalFormFixture(), textFieldFormFixture(), directories, exec, deliveryFixture(), client() (+28 more)

### Community 32 - "pwa.ts"
Cohesion: 0.09
Nodes (37): getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate(), retryHubCopilotModels(), testNotification() (+29 more)

### Community 33 - "app.ts"
Cohesion: 0.08
Nodes (23): prefixes, session, trusted, untrusted, directories, buildApp(), errorStatusCode(), isAppleTouchIconProbe() (+15 more)

### Community 35 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 36 - "lib.rs"
Cohesion: 0.14
Nodes (33): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+25 more)

### Community 37 - "cleanDialogLine"
Cohesion: 0.14
Nodes (34): activeBottomFrame(), captureBeforeDeadline(), cleanDialogLine(), clearAutomaticStartupPrompts(), composerFocusWitnessed(), containsCopiedInteractiveFrame(), desktopInstallPromptIdentity(), findTerminalWrappedText() (+26 more)

### Community 38 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 39 - "TerminalSessionController"
Cohesion: 0.06
Nodes (12): fixtures, recoverAndSeed(), releases, bootLegacy(), directories, execute, pending, releases (+4 more)

### Community 40 - "hub-routes.ts"
Cohesion: 0.06
Nodes (37): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+29 more)

### Community 41 - "agentic-remote-gate"
Cohesion: 0.12
Nodes (36): agentic-remote-gate script, assert_tree(), CLONE_BASE, conclude(), CONTEXT, die(), elapsed(), fail() (+28 more)

### Community 42 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 44 - "normalizeKnowledgeRelativePath"
Cohesion: 0.11
Nodes (27): joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath(), slashPath(), getSessionKnowledgeRoot(), requestSessionKnowledgeRoot() (+19 more)

### Community 45 - "dependencies"
Cohesion: 0.06
Nodes (35): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/static, @fastify/websocket (+27 more)

### Community 46 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 47 - "terminal-session.test.ts"
Cohesion: 0.08
Nodes (28): composerHoldsOtherText(), composerTookPaste(), occurrences(), paneEvidenceCount(), paneShowsText(), parseTerminalUpdateNotice(), pasteCouldCollapse(), pastedPlaceholderCount() (+20 more)

### Community 48 - "agentic-remote"
Cohesion: 0.13
Nodes (31): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+23 more)

### Community 49 - "SessionKnowledgeStore"
Cohesion: 0.13
Nodes (10): bindingKey(), SessionKnowledgeConflictError, SessionKnowledgeRecoveryError, SessionKnowledgeStore, disk, fixture(), fixtures, releases (+2 more)

### Community 50 - "recordValue"
Cohesion: 0.17
Nodes (22): activityKind(), activityResult(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), foregroundTurnOpen(), isBackgroundTaskEvent() (+14 more)

### Community 51 - "background-task-adapter.ts"
Cohesion: 0.11
Nodes (27): attachmentModeValue(), BackgroundTaskEventOptions, CopilotClientTaskInfo, CopilotClientTaskProgress, CopilotTaskInfo, CopilotTaskProgress, isBackgroundTaskInfo(), isBackgroundTaskProgress() (+19 more)

### Community 52 - "backgroundTasksFromEvents"
Cohesion: 0.17
Nodes (30): addActivity(), backgroundHandoff(), backgroundTasksFromEvents(), booleanValue(), boundedText(), errorValue(), eventString(), eventTask() (+22 more)

### Community 53 - "SessionOrderStore"
Cohesion: 0.15
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 54 - "shared/settings-profile.ts"
Cohesion: 0.11
Nodes (27): AccentSetting, appearanceSettings, applySettingsChanges(), isRecord(), isSettingsRevision(), NewSessionFoldersSetting, NewSessionRuntimesSetting, oneOf() (+19 more)

### Community 55 - "session-reply-durability.test.ts"
Cohesion: 0.12
Nodes (19): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRequest() (+11 more)

### Community 56 - "SessionStatus"
Cohesion: 0.11
Nodes (23): Seen, Row, SessionExecutionMode, SessionStatus, TerminalSendPolicyInput, TerminalSendRequestOptions, booleans, combinations (+15 more)

### Community 57 - "session-patch-browser.ts"
Cohesion: 0.14
Nodes (25): advance(), connections, content(), FrameMeasurement, instrument(), lastHeading(), message(), open() (+17 more)

### Community 58 - "KnowledgeStore"
Cohesion: 0.16
Nodes (8): WorkspaceFixtureState, KnowledgeRootReservation, KnowledgeState, KnowledgeStore, directories, fixture(), createHub(), KnowledgeRoot

### Community 59 - "UserInputReplyInput"
Cohesion: 0.18
Nodes (4): persistedFormAnswer(), TerminalFormContinuation, TerminalFormReplyError, UserInputReplyInput

### Community 60 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 61 - "delegated-transcription-service.ts"
Cohesion: 0.12
Nodes (13): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, transcriptionComputerName() (+5 more)

### Community 62 - "manager-context.ts"
Cohesion: 0.14
Nodes (20): ago(), attentionRank(), buildTurnContext(), changeLines(), clock(), MANAGER_STRUCTURED_MEMORY_SYSTEM_PROMPT, MANAGER_SYSTEM_PROMPT, managerPrompt() (+12 more)

### Community 63 - ".toolHost"
Cohesion: 0.10
Nodes (5): ManagerHub, ManagerSdkClient, hasExplicitStructuredMemoryIntent(), memoryObject, StructuredMemoryMutationOperation

### Community 64 - "send-matrix.integration.test.ts"
Cohesion: 0.08
Nodes (23): BUSY, busyWithoutComposer, CLEAR_REFUSED, client(), dialogs, Draft, drained, exec (+15 more)

### Community 65 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 66 - "HubEvent"
Cohesion: 0.14
Nodes (13): Connection, WorkspaceFixture, ComputerManagerEvents, Client, PatchSocket, Browser, seedOffset, ChatMessage (+5 more)

### Community 67 - "ManagerMessage"
Cohesion: 0.12
Nodes (15): confirmationSchema, defaultsSchema, editSchema, effort, managerInputError(), ManagerRouteAgent, messageParams, registerManagerRoutes() (+7 more)

### Community 68 - "manager-structured-memory-search.ts"
Cohesion: 0.14
Nodes (22): authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord(), ManagerStructuredMemoryFormattedContext (+14 more)

### Community 69 - "settings-profile-store.ts"
Cohesion: 0.14
Nodes (16): directories, fakeManager(), hub(), local, profileStore(), SettingsProfileState, SettingsProfileStore, directories (+8 more)

### Community 70 - "src/settings-profile.ts"
Cohesion: 0.10
Nodes (21): AppearanceSetting, NewSessionRuntime, SETTINGS_MAX_COMPUTERS, settingsProfileKeys, SettingsProfileValues, statuslineItems, Appearance, appearanceFrom() (+13 more)

### Community 71 - "SettingsProfileClient"
Cohesion: 0.19
Nodes (5): sameSettingValue(), errorText(), isRefusal(), samePending(), SettingsProfileClient

### Community 72 - "transcription-service.ts"
Cohesion: 0.10
Nodes (20): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+12 more)

### Community 73 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 74 - "manager-structured-memory.ts"
Cohesion: 0.10
Nodes (20): openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS, MANAGER_STRUCTURED_MEMORY_MAX_KEY_CHARS, MANAGER_STRUCTURED_MEMORY_MAX_QUERY_CHARS, MANAGER_STRUCTURED_MEMORY_MAX_REQUEST_ID_CHARS, MANAGER_STRUCTURED_MEMORY_VERSION (+12 more)

### Community 75 - "ManagerStructuredMemoryStore"
Cohesion: 0.23
Nodes (7): digest(), ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryStore, ManagerStructuredMemoryCorrectInput, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryRememberInput, ManagerStructuredMemoryState

### Community 76 - "manager-structured-memory-store.ts"
Cohesion: 0.15
Nodes (17): ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryStoreOptions, ManagerStructuredMemoryValidationError, persistedPrivateContent(), privateFields(), selectedFields(), ImportState, validateStructuredMemoryCorrect() (+9 more)

### Community 77 - "capture-workspace.ts"
Cohesion: 0.19
Nodes (21): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+13 more)

### Community 78 - "use-oracle-settings.ts"
Cohesion: 0.15
Nodes (13): RuntimeModelOption, getManager(), updateManagerSettings(), effortFrom(), efforts, OracleModelSettings(), OracleSettingsStatus(), HarnessProps (+5 more)

### Community 79 - "startup-phases.test.ts"
Cohesion: 0.12
Nodes (13): phases, port, createStartupPhases(), silentStartupPhases, startManagedServer(), StartupPhaseEvent, StartupPhaseRecord, address (+5 more)

### Community 80 - "session-clear-transcript.test.ts"
Cohesion: 0.11
Nodes (9): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions, disk, fixtures, gate(), holdTurnWrite() (+1 more)

### Community 81 - "session-knowledge-store.ts"
Cohesion: 0.10
Nodes (20): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+12 more)

### Community 82 - "session-resource-clear.test.ts"
Cohesion: 0.12
Nodes (19): apps, directories, directory(), obstructUploads(), pairedFixture(), providers, seed(), sockets (+11 more)

### Community 83 - "PromptCards.tsx"
Cohesion: 0.15
Nodes (20): PendingUserInput, UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question (+12 more)

### Community 84 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 85 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 86 - "submission-error.ts"
Cohesion: 0.16
Nodes (11): BuildAppOptions, directories, runtimes, start(), trusted, RemoteNodeRedirectError, RemoteNodeRequestError, httpDeliveryUncertain() (+3 more)

### Community 87 - "refusal-metrics.ts"
Cohesion: 0.15
Nodes (16): countsAsRefusal(), DEFAULT_MAX_REFUSAL_KEYS, httpRefusalReason(), keyId(), notedReasons, noteRefusalReason(), overflowId, reasonCodeFromChain() (+8 more)

### Community 88 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (9): claude(), clearFixture(), copilot(), disk, event(), fixtures, holdOtherWrite(), releases (+1 more)

### Community 89 - "knowledge-tree.ts"
Cohesion: 0.18
Nodes (17): WorkspaceEntry, knowledgeTreeKeyDown(), toggleKnowledgeFolder(), collapseKnowledgeFolder(), expandKnowledgeFolder(), knowledgeAncestors(), KnowledgeCrumb, knowledgeCrumbs() (+9 more)

### Community 90 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 91 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 92 - "server/side-question.ts"
Cohesion: 0.20
Nodes (10): SIDE_QUESTION_CLEANUP_MS, SIDE_QUESTION_RUNTIME_IDLE_MS, SIDE_QUESTION_TIMEOUT_MS, sideQuestionBoundary(), SideQuestionError, sideQuestionPrompt(), withSideQuestionTimeout(), SIDE_QUESTION_EARLIER_ANSWER_MAX_LENGTH (+2 more)

### Community 93 - "directory-browser.ts"
Cohesion: 0.23
Nodes (11): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin(), SessionDirectoryError (+3 more)

### Community 94 - "session-resource-routes.test.ts"
Cohesion: 0.13
Nodes (9): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription (+1 more)

### Community 95 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 96 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 97 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 98 - "terminal-form-deadline.test.ts"
Cohesion: 0.13
Nodes (13): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+5 more)

### Community 99 - "react"
Cohesion: 0.14
Nodes (8): react, drawDiagram(), drawing, MermaidDiagram(), SessionActions(), recordingDuration(), FakeRecorder, useVoiceRecorder()

### Community 100 - "session-latency-benchmark.ts"
Cohesion: 0.24
Nodes (16): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+8 more)

### Community 101 - "recovery-resend-durability.test.ts"
Cohesion: 0.14
Nodes (13): directories, disk, fixture(), gate(), gates, initialize(), PublicSessionValue, runtimes (+5 more)

### Community 102 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 103 - "promotion-monitor.test.ts"
Cohesion: 0.28
Nodes (14): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+6 more)

### Community 104 - "server/session-patches.ts"
Cohesion: 0.22
Nodes (7): diffMessages(), Publication, sameMessage(), sessionKey(), SessionPublications, SessionUpserted, SessionMessagesPatch

### Community 105 - "NewSessionDialog"
Cohesion: 0.20
Nodes (16): activateSession(), createSession(), listDirectories(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), moveSessionToBrowsedFolder(), reopenInterruptedSession() (+8 more)

### Community 106 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+7 more)

### Community 107 - "background-task-stop.test.ts"
Cohesion: 0.23
Nodes (12): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), started() (+4 more)

### Community 108 - "check-workspace-review-regressions.ts"
Cohesion: 0.15
Nodes (11): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+3 more)

### Community 109 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 110 - "registerSessionKnowledgeRoutes"
Cohesion: 0.30
Nodes (11): registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession(), recordReplacement() (+3 more)

### Community 111 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 112 - "BackgroundTasksDialog.tsx"
Cohesion: 0.23
Nodes (10): DialogFrame(), BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive() (+2 more)

### Community 113 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 114 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 115 - "background-task-tracker.ts"
Cohesion: 0.27
Nodes (7): snapshot(), backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 116 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 118 - ".initialize"
Cohesion: 0.24
Nodes (4): isMissing(), ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryRecoveryError, open()

### Community 119 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 120 - "copilot-sdk-client.ts"
Cohesion: 0.31
Nodes (8): COPILOT_SDK_SESSION_DISCOVERY, copilotSdkClientOptions(), CopilotSdkMissingSessionRetirement, CopilotSdkRuntimeDiagnostic, CopilotSdkRuntimeDiagnosticClient, createCopilotSdkClient(), readCopilotSdkRuntimeDiagnostic(), retireMissingCopilotSdkSession()

### Community 121 - "session-knowledge-routes.ts"
Cohesion: 0.18
Nodes (6): Lineage, RegistrationGeneration, ReplacementEvidence, SessionKnowledgeLifecycle, sessionParams, updateSchema

### Community 122 - "settings-profile.test.ts"
Cohesion: 0.20
Nodes (4): settingsProfileCacheKey, SettingsProfileTransport, cached(), MemoryStorage

### Community 123 - "node:fs/promises"
Cohesion: 0.27
Nodes (7): disk, fixture(), fixtures, prompt(), ready(), releases, session()

### Community 124 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 125 - "file-upload-routes.ts"
Cohesion: 0.29
Nodes (6): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile()

### Community 126 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 127 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 128 - "manager-structured-memory-performance.test.ts"
Cohesion: 0.31
Nodes (6): benchmarkState(), now(), openFixture(), searchSamples(), MANAGER_STRUCTURED_MEMORY_MAX_STORE_BYTES, ManagerStructuredMemorySearchResult

### Community 129 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 130 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, packageManager, private, type, version

### Community 131 - "agent-service.test.ts"
Cohesion: 0.25
Nodes (6): terminalFormSteps(), cliDiscovery, directories, services, TerminalCancelOptions, UserInputForm

### Community 132 - "recovery-context.ts"
Cohesion: 0.32
Nodes (6): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, message(), sendLikeTheApp()

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

### Community 137 - "SessionRuntimeInfo"
Cohesion: 0.38
Nodes (3): listTmuxSessions(), safeWindowName(), SessionRuntimeInfo

### Community 138 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 140 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 141 - "usePanelWidth"
Cohesion: 0.47
Nodes (6): boundWidth(), readWidth(), storeWidth(), usePanelWidth(), commit(), finish()

### Community 142 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 143 - "vite.config.ts"
Cohesion: 0.33
Nodes (4): canaryTests, packageVersion, slowTests, tmuxTests

## Knowledge Gaps
- **907 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+902 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1396 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `SessionStore` connect `SessionStore` to `AgentService`, `SessionDetail`, `claude-agent-service.ts`, `recordValue`, `agent-service.ts`, `session-store.ts`, `UserInputReplyInput`, `session-resource-providers.test.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `RemoteNodeClient` connect `RemoteNodeClient` to `claude-agent-service.ts`, `UserInputReplyInput`, `contracts.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionService` connect `SessionService` to `contracts.ts`, `claude-agent-service.ts`, `RemoteNodeClient`, `ProviderSessionService`, `session-resource-providers.test.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `App()` (e.g. with `createSettingsProfileClient()` and `prefersLightNow()`) actually correct?**
  _`App()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _907 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.038766563223486525 - nodes in this community are weakly interconnected._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.02717578259373925 - nodes in this community are weakly interconnected._
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
- `src/index.css`
