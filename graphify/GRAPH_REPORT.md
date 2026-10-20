# Agentic Remote - Graphify code map

Snapshot: `74932da28110b7d93f0a2ad6c60f4e5e81226eaf74e17c5ad9f621b5c0999d91`

Source checkout: `e755c1b52bdd8d186db28db9ea619c80fa725f83`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 305 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 305 files · ~615,517 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 4763 nodes · 13368 edges · 178 communities (139 shown, 24 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 868 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- App
- api.ts
- App.tsx
- SessionStore
- ClaudeAgentService
- agent-service.test.ts
- contracts.ts
- background-task-adapter.ts
- terminal-session.ts
- agentic-remote-promotion-monitor
- markdown-navigation.ts
- session-resources.ts
- session-presentation.ts
- manager-structured-memory-validation.ts
- queued-dispatch.test.ts
- ManagerAgent
- manager-tools.ts
- SessionDetail
- hub-routes.ts
- ManagerAssistant.tsx
- agent-service.ts
- session-knowledge-store.ts
- ManagedSession
- workspace-fixtures.ts
- TmuxTerminalSessionController
- session-store.ts
- bundle
- session-knowledge-routes.test.ts
- RemoteNodeClient
- manager-agent.ts
- ProviderSessionService
- terminal-startup-queue.test.ts
- pwa.ts
- lib.rs
- shell.ts
- agentic-remote-promotion-setup
- config.rs
- claude-agent-service.ts
- SessionService
- knowledge-tree.ts
- devDependencies
- active-sessions.ts
- push-notification-service.ts
- FakeSessionService
- agentic-remote
- .sendInternal
- dependencies
- app.ts
- node-routes.ts
- manager-agent.test.ts
- PushNotificationService
- TerminalSessionController
- ManagerStructuredMemoryStore
- SessionOrderStore
- tmux-errors.integration.test.ts
- .handleSessionEvent
- manager-store.ts
- manager-structured-memory.ts
- shared/settings-profile.ts
- ManagerMessage
- settings-profile-store.ts
- terminal-session.test.ts
- session-patch-browser.ts
- HubEvent
- delegated-transcription-service.ts
- cli-canary.ts
- manager-proactive-inbox.ts
- scripts
- manager-structured-memory-search.ts
- src/settings-profile.ts
- SettingsProfileClient
- ManagerStore
- session-knowledge-routes.ts
- transcription-service.ts
- compilerOptions
- react
- .startAdmitted
- session-reply-durability.test.ts
- capture-workspace.ts
- ResourceReads
- use-oracle-settings.ts
- startup-phases.test.ts
- terminal-form-deadline.test.ts
- compilerOptions
- ManagerStructuredMemoryRuntime
- NewSessionDialog
- compilerOptions
- compilerOptions
- session-resource-routes.test.ts
- event-log.ts
- ManagerMemory
- session-store-providers.test.ts
- workspace-browser.ts
- ComputerSummary
- NodeIdentityStore
- .toolHost
- use-session-knowledge-root.ts
- recovery-resend-durability.test.ts
- session-latency-benchmark.ts
- server/side-question.ts
- BackgroundTaskSnapshot
- .observe
- ReaderWorkspace
- server/session-patches.ts
- .withFormViewport
- capture
- desktop.json
- theme-contrast.test.ts
- BackgroundTasksDialog.tsx
- .oxlintrc.json
- settings-local.json
- validatePersistedState
- promotion-monitor.test.ts
- TranscriptionError
- scripts
- ManagerProactiveInbox
- SessionAdmissions
- session-response-order.ts
- html-preview.ts
- settings-profile.test.ts
- generate-pwa-icons.ts
- manager-structured-memory-performance.test.ts
- bridge.rs
- screenshot-stability.test.ts
- ManagerProactiveInboxValidationError
- manager-proactive-inbox.test.ts
- promotion-setup-execution.test.ts
- remote-node-client.test.ts
- submission-error.ts
- KnowledgePosition
- package.json
- release-publication.test.ts
- session-patch-routes.test.ts
- render-workspace-gifs.ts
- history-projection.test.ts
- recovery-context.ts
- settings-profile-routes.ts
- settings.ts
- .transport
- SessionFileUpload
- composer-layout.test.ts
- usePanelWidth
- HubEventSource
- hasRunningBackgroundAgent
- FakeRecorder
- .discoverTerminalSessions
- .createEvent
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

## Communities (178 total, 24 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.05
Nodes (8): agentMode(), AgentService, isMissingSessionError(), removeCopilotSessionFiles(), RuntimeConfigurationError, terminalAnswerRefused(), queueConflict(), TranscriptObservation

### Community 1 - "App"
Cohesion: 0.03
Nodes (146): isManagerEvent(), submissionReceiptFromError(), deleteKnowledgeRoot(), moveSessionToTmux(), replyPermission(), replyUserInput(), restartSession(), setSessionNotificationsMuted() (+138 more)

### Community 2 - "api.ts"
Cohesion: 0.03
Nodes (107): SettingsChange, SettingsProfileKey, parseSubmissionReceipt(), addKnowledgeRoot(), askSession(), bootstrapSessionOrder(), cancelBackgroundTask(), cancelSession() (+99 more)

### Community 3 - "App.tsx"
Cohesion: 0.03
Nodes (102): addComputer(), configureRuntime(), removeComputer(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation() (+94 more)

### Community 4 - "SessionStore"
Cohesion: 0.04
Nodes (36): fixture(), restart(), connect(), createStore(), enqueue(), fixture(), recoveryFixture(), fixture() (+28 more)

### Community 5 - "ClaudeAgentService"
Cohesion: 0.04
Nodes (23): ClaudeAgentService, isMissingClaudeSessionError(), cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle() (+15 more)

### Community 6 - "agent-service.test.ts"
Cohesion: 0.03
Nodes (69): CopilotClientLike, CopilotSessionLike, foregroundTurnOpen(), holdProbe(), fixtures, gate(), releases, directories (+61 more)

### Community 7 - "contracts.ts"
Cohesion: 0.05
Nodes (52): managers, releases, remote, RemoteResync, RemoteSessionRead, RegistryState, directories, StoredNodeIdentity (+44 more)

### Community 8 - "background-task-adapter.ts"
Cohesion: 0.06
Nodes (74): DeferredSession, addActivity(), attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), boundedText() (+66 more)

### Community 9 - "terminal-session.ts"
Cohesion: 0.05
Nodes (69): boxedComposerFrame(), captureTerminal(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFocusWitnessed(), composerFrameText(), composerHasFocus(), composerHoldsOtherText() (+61 more)

### Community 10 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (71): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+63 more)

### Community 11 - "markdown-navigation.ts"
Cohesion: 0.05
Nodes (56): UserInputField, UserInputFieldValue, followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), MarkdownImage(), missingDocumentFragment(), WorkspaceDialog() (+48 more)

### Community 12 - "session-resources.ts"
Cohesion: 0.09
Nodes (46): ClaudeResources, RemoteNodeRedirectError, claudeMcp(), claudeSkillNames(), copilotMcp, copilotSkills, copilotWorkspaceMcp, CopilotWorkspaceSkills (+38 more)

### Community 13 - "session-presentation.ts"
Cohesion: 0.06
Nodes (52): SessionExecutionMode, saveSessionOrderLane(), handleDragEnd(), KnowledgeRootSelector(), root, reorderSessionLaneWithHiddenFollowers(), SessionFilter, sessionNavigationView (+44 more)

### Community 14 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 15 - "queued-dispatch.test.ts"
Cohesion: 0.05
Nodes (28): acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight(), QueuedDelivery, QueuedDispatches (+20 more)

### Community 16 - "ManagerAgent"
Cohesion: 0.10
Nodes (9): checkContent(), delay(), errorMessage(), isNotFound(), ManagerAgent, sameRuntime(), withTimeout(), ManagerSkillSummary (+1 more)

### Community 17 - "manager-tools.ts"
Cohesion: 0.07
Nodes (29): APPROVE_WORDS, computerField, createManagerTools(), define(), deliver(), requireComputer(), resolveSession(), structuredTools() (+21 more)

### Community 18 - "SessionDetail"
Cohesion: 0.09
Nodes (6): isUncertainDelivery(), persistedFormAnswer(), fixture(), SessionDetail, UserInputReplyInput, deliveryUncertaintyFromError()

### Community 19 - "hub-routes.ts"
Cohesion: 0.06
Nodes (52): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+44 more)

### Community 20 - "ManagerAssistant.tsx"
Cohesion: 0.07
Nodes (42): MANAGER_MESSAGE_MAX_LENGTH, ManagerConfirmation, ManagerMessageRole, ManagerMessageState, ManagerSessionRef, ManagerSnapshot, ManagerStatus, ResolveManagerConfirmationInput (+34 more)

### Community 21 - "agent-service.ts"
Cohesion: 0.04
Nodes (50): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), ActivityToolStart, AgentServiceEvents, ansiSequence, commandShortcut() (+42 more)

### Community 22 - "session-knowledge-store.ts"
Cohesion: 0.07
Nodes (30): bindingKey(), bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor() (+22 more)

### Community 23 - "ManagedSession"
Cohesion: 0.15
Nodes (7): ComputerManager, managedSession(), RemoteSessionListing, registerHubRoutes(), ManagedRemovedQueuedPrompt, ManagedSession, SessionListing

### Community 24 - "workspace-fixtures.ts"
Cohesion: 0.06
Nodes (41): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, accents (+33 more)

### Community 25 - "TmuxTerminalSessionController"
Cohesion: 0.11
Nodes (12): copilotCommand(), endProbeSession(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand(), safeWindowName(), submitTerminalForm() (+4 more)

### Community 26 - "session-store.ts"
Cohesion: 0.05
Nodes (34): disk, fixtures, gate(), holdTurnWrite(), releases, activityDuration(), activityResultPreview(), archivedMessage() (+26 more)

### Community 27 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 28 - "session-knowledge-routes.test.ts"
Cohesion: 0.08
Nodes (17): ServerRole, SessionMetadataLookup, SessionMuteCarrier, KnowledgeRootReservation, KnowledgeState, KnowledgeStore, directories, disk (+9 more)

### Community 29 - "RemoteNodeClient"
Cohesion: 0.07
Nodes (7): headerSafe(), RemoteNodeClient, NodeInfo, RemovedQueuedPrompt, WorkspaceFile, WorkspaceListing, WorkspaceFileIcon()

### Community 30 - "manager-agent.ts"
Cohesion: 0.08
Nodes (29): discover(), isPending(), isQueued(), ManagerAgentOptions, Rung, TURN_ACTIVITY, TurnError, ago() (+21 more)

### Community 32 - "terminal-startup-queue.test.ts"
Cohesion: 0.11
Nodes (35): exec, formFixture(), horizontalFormFixture(), textFieldFormFixture(), directories, exec, client(), disk (+27 more)

### Community 33 - "pwa.ts"
Cohesion: 0.09
Nodes (37): getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate(), retryHubCopilotModels(), testNotification() (+29 more)

### Community 34 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 35 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 36 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 37 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 38 - "claude-agent-service.ts"
Cohesion: 0.10
Nodes (24): AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission, PendingClaudeReply (+16 more)

### Community 39 - "SessionService"
Cohesion: 0.10
Nodes (3): registerNodeRoutes(), isSessionResourceRoute(), SessionService

### Community 40 - "knowledge-tree.ts"
Cohesion: 0.09
Nodes (34): WorkspaceEntry, readKnowledgeFile(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor(), knowledgeTreeKeyDown() (+26 more)

### Community 41 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 42 - "active-sessions.ts"
Cohesion: 0.12
Nodes (31): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+23 more)

### Community 43 - "push-notification-service.ts"
Cohesion: 0.11
Nodes (23): ManagerEventSource, brief(), OracleEventSource, PushPolicy, PushSender, PushState, directories, RFC-8030 (+15 more)

### Community 44 - "FakeSessionService"
Cohesion: 0.08
Nodes (4): FakeSessionService, routingFixture(), session(), temporaryDirectory()

### Community 45 - "agentic-remote"
Cohesion: 0.13
Nodes (31): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+23 more)

### Community 46 - ".sendInternal"
Cohesion: 0.16
Nodes (24): activeBottomFrame(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), containsCopiedInteractiveFrame(), desktopInstallPromptIdentity(), findTerminalWrappedText(), hasComposerAfter() (+16 more)

### Community 47 - "dependencies"
Cohesion: 0.06
Nodes (33): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, @fastify/multipart, @fastify/static, @fastify/websocket, lucide-react (+25 more)

### Community 48 - "app.ts"
Cohesion: 0.10
Nodes (20): prefixes, session, trusted, untrusted, directories, buildApp(), errorStatusCode(), isAppleTouchIconProbe() (+12 more)

### Community 49 - "node-routes.ts"
Cohesion: 0.07
Nodes (28): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile(), AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER (+20 more)

### Community 50 - "manager-agent.test.ts"
Cohesion: 0.08
Nodes (14): ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig, Behavior, computers, fail(), FakeClient (+6 more)

### Community 51 - "PushNotificationService"
Cohesion: 0.16
Nodes (7): PushNotificationService, scoped(), registerPushRoutes(), sessionMuteSchema, subscriptionSchema, testNotificationSchema, unsubscribeSchema

### Community 52 - "TerminalSessionController"
Cohesion: 0.08
Nodes (6): fixtures, recoverAndSeed(), releases, TerminalSessionController, PendingPermission, PendingUserInput

### Community 53 - "ManagerStructuredMemoryStore"
Cohesion: 0.18
Nodes (9): capturePrompt(), digest(), isMissing(), ManagerStructuredMemoryRecoveryError, ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryStore, open(), ManagerStructuredMemoryMutationResult (+1 more)

### Community 54 - "SessionOrderStore"
Cohesion: 0.15
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 55 - "tmux-errors.integration.test.ts"
Cohesion: 0.09
Nodes (21): execFileAsync, headers, ignoreMissing(), removeFixture(), seedSession(), sessionLog(), stopOwnedServer(), noTmuxServer() (+13 more)

### Community 56 - ".handleSessionEvent"
Cohesion: 0.18
Nodes (21): activityKind(), activityResult(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), isBackgroundTaskEvent(), isForegroundCompletionEvent() (+13 more)

### Community 57 - "manager-store.ts"
Cohesion: 0.14
Nodes (16): TurnContextInput, JournalRecorder, JournalRecorderOptions, Seen, sessionTask(), JournalDraft, JournalEntry, JournalKind (+8 more)

### Community 58 - "manager-structured-memory.ts"
Cohesion: 0.08
Nodes (24): ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryStoreOptions, MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS, MANAGER_STRUCTURED_MEMORY_MAX_KEY_CHARS, MANAGER_STRUCTURED_MEMORY_MAX_QUERY_CHARS, MANAGER_STRUCTURED_MEMORY_MAX_RECORDS (+16 more)

### Community 59 - "shared/settings-profile.ts"
Cohesion: 0.11
Nodes (27): AccentSetting, appearanceSettings, isRecord(), isSettingsDeviceId(), isSettingsRevision(), NewSessionFoldersSetting, NewSessionRuntimesSetting, oneOf() (+19 more)

### Community 60 - "ManagerMessage"
Cohesion: 0.12
Nodes (16): confirmationSchema, defaultsSchema, editSchema, effort, managerInputError(), ManagerRouteAgent, messageParams, registerManagerRoutes() (+8 more)

### Community 61 - "settings-profile-store.ts"
Cohesion: 0.13
Nodes (17): directories, fakeManager(), hub(), local, profileStore(), SettingsProfileState, SettingsProfileStore, directories (+9 more)

### Community 62 - "terminal-session.test.ts"
Cohesion: 0.09
Nodes (22): parseTerminalUpdateNotice(), terminalChecklistState(), terminalFormCommitKeys(), bracketedTabPane, clearFixture(), deliveryFixture(), desktopInstallPane, directories (+14 more)

### Community 63 - "session-patch-browser.ts"
Cohesion: 0.14
Nodes (25): advance(), connections, content(), FrameMeasurement, instrument(), lastHeading(), message(), open() (+17 more)

### Community 64 - "HubEvent"
Cohesion: 0.13
Nodes (14): Connection, WorkspaceFixture, ComputerManagerEvents, Client, PatchSocket, Browser, seedOffset, StoredSession (+6 more)

### Community 65 - "delegated-transcription-service.ts"
Cohesion: 0.12
Nodes (13): BuildAppOptions, collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation (+5 more)

### Community 66 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 67 - "manager-proactive-inbox.ts"
Cohesion: 0.08
Nodes (26): cloneState(), DISPOSITIONS, EVENT_KINDS, MANAGER_PROACTIVE_INBOX_MAX_EVENT_RECORDS, MANAGER_PROACTIVE_INBOX_MAX_PENDING_EVENTS, MANAGER_PROACTIVE_INBOX_MAX_PENDING_READ, MANAGER_PROACTIVE_INBOX_MAX_SCOPES, MANAGER_PROACTIVE_INBOX_MAX_STORE_BYTES (+18 more)

### Community 68 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 69 - "manager-structured-memory-search.ts"
Cohesion: 0.14
Nodes (22): authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord(), ManagerStructuredMemoryFormattedContext (+14 more)

### Community 70 - "src/settings-profile.ts"
Cohesion: 0.10
Nodes (21): AppearanceSetting, NewSessionRuntime, SETTINGS_MAX_COMPUTERS, settingsProfileKeys, SettingsProfileValues, statuslineItems, Appearance, appearanceFrom() (+13 more)

### Community 71 - "SettingsProfileClient"
Cohesion: 0.19
Nodes (5): sameSettingValue(), errorText(), isRefusal(), samePending(), SettingsProfileClient

### Community 72 - "ManagerStore"
Cohesion: 0.14
Nodes (4): openStore(), emptyState(), ManagerStore, open()

### Community 73 - "session-knowledge-routes.ts"
Cohesion: 0.13
Nodes (17): Lineage, registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession() (+9 more)

### Community 74 - "transcription-service.ts"
Cohesion: 0.10
Nodes (20): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+12 more)

### Community 75 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 76 - "react"
Cohesion: 0.11
Nodes (11): react, MarkdownCodeBlock(), copy(), originalClipboard, drawDiagram(), drawing, MermaidDiagram(), SessionActions() (+3 more)

### Community 78 - "session-reply-durability.test.ts"
Cohesion: 0.15
Nodes (19): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRequest() (+11 more)

### Community 79 - "capture-workspace.ts"
Cohesion: 0.19
Nodes (21): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+13 more)

### Community 80 - "ResourceReads"
Cohesion: 0.13
Nodes (14): ActiveClaudeQuery, releases, session, snapshot, CopilotResourceMethod, readClaudeMcp(), readCopilotResource(), copilotTransport() (+6 more)

### Community 81 - "use-oracle-settings.ts"
Cohesion: 0.16
Nodes (13): RuntimeModelOption, getManager(), updateManagerSettings(), effortFrom(), efforts, OracleModelSettings(), OracleSettingsStatus(), HarnessProps (+5 more)

### Community 82 - "startup-phases.test.ts"
Cohesion: 0.12
Nodes (12): phases, port, createStartupPhases(), startManagedServer(), StartupPhaseEvent, StartupPhaseRecord, address, directories (+4 more)

### Community 83 - "terminal-form-deadline.test.ts"
Cohesion: 0.12
Nodes (15): TerminalFormContinuation, question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture() (+7 more)

### Community 84 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 85 - "ManagerStructuredMemoryRuntime"
Cohesion: 0.14
Nodes (9): efforts, managerRuntimeSettings, initializeManagerStructuredMemory(), ManagerStructuredMemoryRuntime, openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, ManagerStructuredMemoryMode (+1 more)

### Community 86 - "NewSessionDialog"
Cohesion: 0.16
Nodes (20): activateSession(), createSession(), executeCommand(), listDirectories(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), moveSessionToBrowsedFolder() (+12 more)

### Community 87 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 88 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 89 - "session-resource-routes.test.ts"
Cohesion: 0.13
Nodes (9): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription (+1 more)

### Community 90 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 91 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 92 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (8): claude(), clearFixture(), copilot(), disk, event(), fixtures, releases, sdkSession()

### Community 93 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 94 - "ComputerSummary"
Cohesion: 0.19
Nodes (5): fixture(), session(), sessionAtLeastAsNew(), RegisteredComputer, ComputerSummary

### Community 95 - "NodeIdentityStore"
Cohesion: 0.18
Nodes (4): ComputerRegistry, directories, remoteSnapshotFixture(), NodeIdentityStore

### Community 97 - "use-session-knowledge-root.ts"
Cohesion: 0.19
Nodes (12): getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey(), knowledgePositionForBinding(), SessionIdentity (+4 more)

### Community 98 - "recovery-resend-durability.test.ts"
Cohesion: 0.12
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 99 - "session-latency-benchmark.ts"
Cohesion: 0.24
Nodes (16): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+8 more)

### Community 100 - "server/side-question.ts"
Cohesion: 0.22
Nodes (10): SIDE_QUESTION_CLEANUP_MS, SIDE_QUESTION_RUNTIME_IDLE_MS, SIDE_QUESTION_TIMEOUT_MS, sideQuestionBoundary(), SideQuestionError, sideQuestionPrompt(), withSideQuestionTimeout(), SIDE_QUESTION_EARLIER_ANSWER_MAX_LENGTH (+2 more)

### Community 101 - "BackgroundTaskSnapshot"
Cohesion: 0.20
Nodes (7): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask, BackgroundTaskSnapshot

### Community 102 - ".observe"
Cohesion: 0.21
Nodes (6): ManagerProactiveInboxCapacityError, ManagerProactiveInboxError, ManagerProactiveInboxPersistenceError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError, nowIso()

### Community 103 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 104 - "server/session-patches.ts"
Cohesion: 0.22
Nodes (7): diffMessages(), Publication, sameMessage(), sessionKey(), SessionPublications, SessionUpserted, SessionMessagesPatch

### Community 105 - ".withFormViewport"
Cohesion: 0.23
Nodes (13): FormReplyDeadlineError, hasClippedTerminalFormTabs(), hasTerminalFormQuestionReflowCandidate(), isTerminalLoading(), parseTerminalFormActiveField(), tabNames(), terminalBoxWrap(), terminalControlLines() (+5 more)

### Community 106 - "capture"
Cohesion: 0.18
Nodes (15): releaseRecording(), shortcutKeys(), startRecording(), stopRecording(), binding(), bindingLabel(), capturableCode(), isModifierCode() (+7 more)

### Community 107 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 108 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 109 - "BackgroundTasksDialog.tsx"
Cohesion: 0.23
Nodes (10): DialogFrame(), BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive() (+2 more)

### Community 110 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 111 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 112 - "validatePersistedState"
Cohesion: 0.23
Nodes (13): assertExactKeys(), hasExactKeys(), isDisposition(), isEventKind(), isId(), isOrigin(), isPositiveSafeCounter(), isRecord() (+5 more)

### Community 113 - "promotion-monitor.test.ts"
Cohesion: 0.27
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 114 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 115 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+4 more)

### Community 116 - "ManagerProactiveInbox"
Cohesion: 0.30
Nodes (3): isMissing(), ManagerProactiveInbox, ManagerProactiveInboxRecoveryError

### Community 117 - "SessionAdmissions"
Cohesion: 0.20
Nodes (4): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions

### Community 118 - "session-response-order.ts"
Cohesion: 0.29
Nodes (10): sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), nextSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences, sessionResponseStartedAt() (+2 more)

### Community 119 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 120 - "settings-profile.test.ts"
Cohesion: 0.20
Nodes (4): settingsProfileCacheKey, SettingsProfileTransport, cached(), MemoryStorage

### Community 121 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 122 - "manager-structured-memory-performance.test.ts"
Cohesion: 0.27
Nodes (7): benchmarkState(), now(), openFixture(), searchSamples(), MANAGER_STRUCTURED_MEMORY_MAX_STORE_BYTES, ManagerStructuredMemorySearchResult, submitSearch()

### Community 123 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 124 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 125 - "ManagerProactiveInboxValidationError"
Cohesion: 0.28
Nodes (6): emptyState(), ManagerProactiveInboxValidationError, publicEvent(), requireId(), validateLimit(), validateOptions()

### Community 126 - "manager-proactive-inbox.test.ts"
Cohesion: 0.28
Nodes (6): ManagerProactiveInboxOptions, openInbox(), readState(), statePath(), TestState, writeState()

### Community 127 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 128 - "remote-node-client.test.ts"
Cohesion: 0.28
Nodes (5): client(), servers, session, TERMINAL_REQUEST_TIMEOUT_MS, TERMINAL_STARTUP_TIMEOUT_MS

### Community 129 - "submission-error.ts"
Cohesion: 0.39
Nodes (5): RemoteNodeRequestError, httpDeliveryUncertain(), legacyDefinitiveHttpRefusals, SubmissionError, SubmissionReceipt

### Community 130 - "KnowledgePosition"
Cohesion: 0.36
Nodes (4): WorkspaceFixtureOptions, KnowledgePosition, KnowledgeRestoreState, base

### Community 131 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, packageManager, private, type, version

### Community 132 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 133 - "session-patch-routes.test.ts"
Cohesion: 0.29
Nodes (5): apps, directories, FakeManager, fixture(), trusted

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

### Community 141 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 142 - "usePanelWidth"
Cohesion: 0.47
Nodes (6): boundWidth(), readWidth(), storeWidth(), usePanelWidth(), commit(), finish()

### Community 148 - ".createEvent"
Cohesion: 0.67
Nodes (3): canonicalHash(), eventId(), namespaceId()

## Knowledge Gaps
- **874 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+869 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1342 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **24 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `TmuxTerminalSessionController` connect `TmuxTerminalSessionController` to `.withFormViewport`, `active-sessions.ts`, `TerminalSessionController`, `.sendInternal`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `AgentService` connect `AgentService` to `SessionStore`, `server/side-question.ts`, `claude-agent-service.ts`, `session-resources.ts`, `.startAdmitted`, `SessionFileUpload`, `queued-dispatch.test.ts`, `SessionDetail`, `.discoverTerminalSessions`, `TerminalSessionController`, `.handleSessionEvent`, `session-resource-routes.test.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `App()` (e.g. with `createSettingsProfileClient()` and `prefersLightNow()`) actually correct?**
  _`App()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _874 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.046677728879590215 - nodes in this community are weakly interconnected._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.032679738562091505 - nodes in this community are weakly interconnected._
- **Should `api.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.032431825833239815 - nodes in this community are weakly interconnected._
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
- `docs/design/oracle-proactive-inbox.md`
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
