# Agentic Remote - Graphify code map

Snapshot: `b3c76ebc26e264b6c50d3c3d115f70029b8c215c4e648c7a56135724840bb10a`

Source checkout: `3e316bb521b50cd80ac7871d24d9afb9362403f9`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 268 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 268 files · ~548,882 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 4125 nodes · 11686 edges · 166 communities (128 shown, 23 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 802 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App
- App.tsx
- SessionStore
- AgentService
- api.ts
- ClaudeAgentService
- terminal-session.ts
- agent-service.ts
- agentic-remote-promotion-monitor
- session-presentation.ts
- contracts.ts
- active-sessions.ts
- .get
- ManagerAgent
- manager-tools.ts
- SessionDetail
- TmuxTerminalSessionController
- session-resources.ts
- queued-provider-dispatch.test.ts
- RemoteNodeClient
- markdown-navigation.ts
- bundle
- ComputerManager
- manager-store.ts
- ManagerAssistant.tsx
- SessionService
- terminal-startup-queue.test.ts
- ProviderSessionService
- lib.rs
- shell.ts
- hub-routes.ts
- agentic-remote-promotion-setup
- config.rs
- workspace-fixtures.ts
- pwa.ts
- claude-agent-service.ts
- devDependencies
- terminal-session.test.ts
- knowledge-tree.ts
- agentic-remote
- FakeSessionService
- dependencies
- node-routes.ts
- remote-node-client.ts
- SessionKnowledgeStore
- manager-agent.test.ts
- manager-agent.ts
- session-resource-routes.test.ts
- SessionOrderStore
- .startAdmitted
- CopilotClientLike
- delegated-transcription-service.ts
- KnowledgeStore
- background-task-adapter.ts
- .sendInternal
- cli-canary.ts
- ManagerStore
- scripts
- computer-manager.ts
- ComputerSummary
- normalizeKnowledgeRelativePath
- transcription-service.ts
- compilerOptions
- session-store.ts
- agent-service.test.ts
- app.ts
- session-resource-clear.test.ts
- ManagedSession
- PromptCards.tsx
- capture-workspace.ts
- PushNotificationService
- session-knowledge-store.ts
- HubEvent
- session-admission-lifecycle.test.ts
- startup-phases.test.ts
- ManagerMessage
- session-clear-transcript.test.ts
- workspace-browser.ts
- compilerOptions
- session-reply-durability.test.ts
- compilerOptions
- compilerOptions
- recordValue
- session-resource-providers.test.ts
- ManagerMemory
- session-store-providers.test.ts
- react
- NodeIdentityStore
- event-log.ts
- use-session-knowledge-root.ts
- backgroundTasksFromEvents
- ReaderWorkspace
- terminal-form-deadline.test.ts
- recovery-resend-durability.test.ts
- background-task-stop.test.ts
- queued-dispatch.test.ts
- BackgroundTasksDialog.tsx
- NewSessionDialog
- check-workspace-review-regressions.ts
- desktop.json
- registerSessionKnowledgeRoutes
- settings-local.json
- promotion-monitor.test.ts
- TranscriptionError
- session-response-order.ts
- scripts
- session-knowledge-routes.test.ts
- background-task-tracker.ts
- recovery-seed-guards.test.ts
- OracleSettings.tsx
- html-preview.ts
- server/side-question.ts
- .oxlintrc.json
- generate-pwa-icons.ts
- DeferredSession
- BackgroundTaskSnapshot
- session-enqueue-clear.test.ts
- bridge.rs
- screenshot-stability.test.ts
- promotion-setup-execution.test.ts
- voice-recorder.ts
- KnowledgePosition
- package.json
- SessionFileUpload
- release-publication.test.ts
- UserInputFieldControl
- render-workspace-gifs.ts
- recovery-context.ts
- settings.ts
- composer-layout.test.ts
- usePanelWidth
- hub-routes.test.ts
- SessionKnowledgeLifecycle
- removeComputer
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
- agentic-remote-shell

## God Nodes (most connected - your core abstractions)
1. `SessionDetail` - 276 edges
2. `App()` - 259 edges
3. `AgentService` - 235 edges
4. `SessionStore` - 162 edges
5. `ClaudeAgentService` - 120 edges
6. `ManagedSession` - 91 edges
7. `ComputerManager` - 82 edges
8. `registerHubRoutes()` - 78 edges
9. `SessionService` - 71 edges
10. `TmuxTerminalSessionController` - 67 edges

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

## Communities (166 total, 23 thin omitted)

### Community 0 - "App"
Cohesion: 0.04
Nodes (130): submissionReceiptFromError(), askSession(), activeComposerPastes(), App(), adoptConversationReplacement(), appendComposerForKey(), appKeyDown(), applyComputerSnapshot() (+122 more)

### Community 1 - "App.tsx"
Cohesion: 0.02
Nodes (115): isManagerEvent(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph() (+107 more)

### Community 2 - "SessionStore"
Cohesion: 0.04
Nodes (42): normalizedTitle(), fixture(), restart(), fixture(), connect(), createStore(), deferred(), disk (+34 more)

### Community 3 - "AgentService"
Cohesion: 0.06
Nodes (6): AgentService, isUncertainDelivery(), RuntimeConfigurationError, queueConflict(), deliveryUncertaintyFromError(), SubmissionError

### Community 4 - "api.ts"
Cohesion: 0.04
Nodes (102): parseSubmissionReceipt(), addKnowledgeRoot(), bootstrapSessionOrder(), cancelBackgroundTask(), cancelSession(), clearConversation(), configureRuntime(), definiteDispatchRefusals (+94 more)

### Community 5 - "ClaudeAgentService"
Cohesion: 0.06
Nodes (10): ClaudeAgentService, isMissingClaudeSessionError(), preparePrompt(), claudeFixture(), claudeFixture(), copilotFixture(), directory(), seed() (+2 more)

### Community 6 - "terminal-session.ts"
Cohesion: 0.05
Nodes (78): activeBottomFrame(), boxedComposerFrame(), captureTerminal(), cleanDialogLine(), clearAutomaticStartupPrompts(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFrameText() (+70 more)

### Community 7 - "agent-service.ts"
Cohesion: 0.06
Nodes (64): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, AgentServiceEvents (+56 more)

### Community 8 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (71): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+63 more)

### Community 9 - "session-presentation.ts"
Cohesion: 0.05
Nodes (57): saveSessionOrderLane(), handleDragEnd(), KnowledgeRootSelector(), root, reorderSessionLaneWithHiddenFollowers(), SessionFilter, sessionNavigationView, computers (+49 more)

### Community 10 - "contracts.ts"
Cohesion: 0.06
Nodes (35): ClaudeAgentServiceEvents, directories, ProviderSessionServiceEvents, provider(), RemoteNodeClientEvents, ActivityStatus, AddKnowledgeRootInput, AgentMode (+27 more)

### Community 11 - "active-sessions.ts"
Cohesion: 0.06
Nodes (50): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+42 more)

### Community 12 - ".get"
Cohesion: 0.06
Nodes (5): agentMode(), isMissingSessionError(), removeCopilotSessionFiles(), forgetSessionEvents(), TerminalSessionController

### Community 13 - "ManagerAgent"
Cohesion: 0.10
Nodes (10): checkContent(), delay(), errorMessage(), isNotFound(), ManagerAgent, sameRuntime(), TurnError, withTimeout() (+2 more)

### Community 14 - "manager-tools.ts"
Cohesion: 0.07
Nodes (28): APPROVE_WORDS, computerField, createManagerTools(), define(), deliver(), requireComputer(), resolveSession(), trustFolder() (+20 more)

### Community 15 - "SessionDetail"
Cohesion: 0.09
Nodes (8): persistedFormAnswer(), TerminalFormContinuation, validateUserInputForm(), fixture(), StoredSession, TerminalFormReplyError, SessionDetail, UserInputReplyInput

### Community 16 - "TmuxTerminalSessionController"
Cohesion: 0.11
Nodes (15): copilotCommand(), endProbeSession(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand(), safeWindowName(), submitTerminalForm() (+7 more)

### Community 17 - "session-resources.ts"
Cohesion: 0.12
Nodes (37): ActiveClaudeQuery, claudeMcp(), claudeSkillNames(), copilotMcp, copilotSkills, copilotWorkspaceMcp, CopilotWorkspaceSkills, count() (+29 more)

### Community 18 - "queued-provider-dispatch.test.ts"
Cohesion: 0.08
Nodes (22): acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight(), QueuedDelivery, QueuedDispatches (+14 more)

### Community 19 - "RemoteNodeClient"
Cohesion: 0.06
Nodes (9): RemoteResync, RemoteSessionRead, RemoteNodeClient, NodeInfo, RemovedQueuedPrompt, WorkspaceFile, WorkspaceListing, KnowledgeFolderState (+1 more)

### Community 20 - "markdown-navigation.ts"
Cohesion: 0.09
Nodes (38): executeCommand(), listWorkspace(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink(), KnowledgeReader(), markdownComponentsFor() (+30 more)

### Community 21 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 22 - "ComputerManager"
Cohesion: 0.18
Nodes (4): ComputerManager, managedSession(), registerHubRoutes(), ManagedRemovedQueuedPrompt

### Community 23 - "manager-store.ts"
Cohesion: 0.10
Nodes (27): ago(), attentionRank(), buildTurnContext(), changeLines(), clock(), MANAGER_SYSTEM_PROMPT, managerPrompt(), oneLine() (+19 more)

### Community 24 - "ManagerAssistant.tsx"
Cohesion: 0.09
Nodes (32): ManagerSessionRef, cancelManager(), editQueuedManagerMessage(), removeQueuedManagerMessage(), resetManager(), resolveManagerConfirmation(), retryManagerMessage(), sendManagerMessage() (+24 more)

### Community 26 - "terminal-startup-queue.test.ts"
Cohesion: 0.11
Nodes (35): exec, formFixture(), horizontalFormFixture(), textFieldFormFixture(), directories, exec, client(), disk (+27 more)

### Community 28 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 29 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 30 - "hub-routes.ts"
Cohesion: 0.06
Nodes (38): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+30 more)

### Community 31 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 32 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 33 - "workspace-fixtures.ts"
Cohesion: 0.09
Nodes (29): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, createWorkspaceFixtureState() (+21 more)

### Community 34 - "pwa.ts"
Cohesion: 0.11
Nodes (33): deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate(), toggle() (+25 more)

### Community 35 - "claude-agent-service.ts"
Cohesion: 0.11
Nodes (23): AuthStatusRunner, ClaudeQuestion, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission, PendingClaudeReply, toolResultText() (+15 more)

### Community 36 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 37 - "terminal-session.test.ts"
Cohesion: 0.08
Nodes (29): composerHoldsOtherText(), composerTookPaste(), occurrences(), paneEvidenceCount(), paneShowsText(), parseTerminalUpdateNotice(), pasteCouldCollapse(), pastedPlaceholderCount() (+21 more)

### Community 38 - "knowledge-tree.ts"
Cohesion: 0.10
Nodes (32): listKnowledgeEntries(), readKnowledgeFile(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor(), knowledgeTreeKeyDown() (+24 more)

### Community 39 - "agentic-remote"
Cohesion: 0.13
Nodes (31): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+23 more)

### Community 40 - "FakeSessionService"
Cohesion: 0.08
Nodes (4): FakeSessionService, routingFixture(), session(), temporaryDirectory()

### Community 41 - "dependencies"
Cohesion: 0.06
Nodes (33): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, @fastify/multipart, @fastify/static, @fastify/websocket, lucide-react (+25 more)

### Community 42 - "node-routes.ts"
Cohesion: 0.07
Nodes (28): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile(), AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER (+20 more)

### Community 43 - "remote-node-client.ts"
Cohesion: 0.09
Nodes (20): DEFINITE_DISPATCH_REFUSALS, headerSafe(), normalizeNodeUrl(), REDIRECT_STATUSES, client(), servers, session, RemoteNodeRedirectError (+12 more)

### Community 44 - "SessionKnowledgeStore"
Cohesion: 0.13
Nodes (10): bindingKey(), SessionKnowledgeConflictError, SessionKnowledgeRecoveryError, SessionKnowledgeStore, disk, fixture(), fixtures, releases (+2 more)

### Community 45 - "manager-agent.test.ts"
Cohesion: 0.08
Nodes (14): ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig, Behavior, computers, fail(), FakeClient (+6 more)

### Community 46 - "manager-agent.ts"
Cohesion: 0.11
Nodes (21): ManagerEventSource, discover(), isPending(), isQueued(), ManagerAgentOptions, Rung, TURN_ACTIVITY, ManagerState (+13 more)

### Community 47 - "session-resource-routes.test.ts"
Cohesion: 0.08
Nodes (15): ClaudeResources, releases, session, snapshot, apps, dataDirectory(), directories, pairedFixture() (+7 more)

### Community 48 - "SessionOrderStore"
Cohesion: 0.15
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 49 - ".startAdmitted"
Cohesion: 0.12
Nodes (5): fixture(), httpBoundary(), SideQuestionError, withSideQuestionTimeout(), StartupPhases

### Community 50 - "CopilotClientLike"
Cohesion: 0.07
Nodes (16): CopilotClientLike, holdProbe(), fixtures, gate(), releases, directories, fakeClient(), ForkRequest (+8 more)

### Community 51 - "delegated-transcription-service.ts"
Cohesion: 0.11
Nodes (13): BuildAppOptions, collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation (+5 more)

### Community 52 - "KnowledgeStore"
Cohesion: 0.16
Nodes (8): WorkspaceFixtureState, KnowledgeRootReservation, KnowledgeState, KnowledgeStore, directories, fixture(), createHub(), KnowledgeRoot

### Community 53 - "background-task-adapter.ts"
Cohesion: 0.10
Nodes (24): BackgroundTaskEventOptions, CopilotClientTaskInfo, CopilotClientTaskProgress, CopilotTaskInfo, CopilotTaskProgress, isBackgroundTaskInfo(), isBackgroundTaskProgress(), isLiveTaskStatus() (+16 more)

### Community 54 - ".sendInternal"
Cohesion: 0.17
Nodes (16): capturePane(), composerFocusWitnessed(), composerHoldsText(), composerText(), hasComposerAfter(), hasLiveTerminalComposer(), isTerminalAgentWorking(), isTerminalOverlay() (+8 more)

### Community 55 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 56 - "ManagerStore"
Cohesion: 0.13
Nodes (4): openStore(), emptyState(), ManagerStore, open()

### Community 57 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 58 - "computer-manager.ts"
Cohesion: 0.11
Nodes (16): managers, releases, remote, RegistryState, StoredNodeIdentity, readSessionMcpServers(), readSessionSkills(), ResourceRead (+8 more)

### Community 59 - "ComputerSummary"
Cohesion: 0.15
Nodes (5): fixture(), session(), sessionAtLeastAsNew(), RegisteredComputer, ComputerSummary

### Community 60 - "normalizeKnowledgeRelativePath"
Cohesion: 0.15
Nodes (20): Lineage, RegistrationGeneration, ReplacementEvidence, sessionParams, updateSchema, joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute() (+12 more)

### Community 61 - "transcription-service.ts"
Cohesion: 0.10
Nodes (20): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+12 more)

### Community 62 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 63 - "session-store.ts"
Cohesion: 0.08
Nodes (19): PendingTerminalQueueSettlement, TerminalDiscoveryError, activityDuration(), activityResultPreview(), archivedMessage(), DiscoveredSession, emptyRetirements, PendingChange (+11 more)

### Community 64 - "agent-service.test.ts"
Cohesion: 0.12
Nodes (13): CopilotSessionLike, foregroundTurnOpen(), terminalFormSteps(), configurableModel(), directories, FakeCopilotClient, probeService(), services (+5 more)

### Community 65 - "app.ts"
Cohesion: 0.14
Nodes (17): prefixes, session, trusted, untrusted, directories, buildApp(), errorStatusCode(), isAppleTouchIconProbe() (+9 more)

### Community 66 - "session-resource-clear.test.ts"
Cohesion: 0.11
Nodes (20): apps, directories, directory(), obstructUploads(), pairedFixture(), providers, seed(), sockets (+12 more)

### Community 67 - "ManagedSession"
Cohesion: 0.17
Nodes (5): RemoteSessionListing, ManagerHub, TurnContextInput, ManagedSession, SessionListing

### Community 68 - "PromptCards.tsx"
Cohesion: 0.13
Nodes (16): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+8 more)

### Community 69 - "capture-workspace.ts"
Cohesion: 0.19
Nodes (21): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+13 more)

### Community 70 - "PushNotificationService"
Cohesion: 0.25
Nodes (3): brief(), PushNotificationService, registerPushRoutes()

### Community 71 - "session-knowledge-store.ts"
Cohesion: 0.10
Nodes (20): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+12 more)

### Community 72 - "HubEvent"
Cohesion: 0.11
Nodes (13): WorkspaceFixture, ComputerManagerEvents, HubEventSource, PushSender, PushState, directories, RFC-8030, RFC-8030 (+5 more)

### Community 73 - "session-admission-lifecycle.test.ts"
Cohesion: 0.11
Nodes (15): build(), trusted, deferred(), disk, enqueue(), fixtures, holdAdmissionWrite(), releases (+7 more)

### Community 74 - "startup-phases.test.ts"
Cohesion: 0.12
Nodes (12): phases, port, createStartupPhases(), startManagedServer(), StartupPhaseEvent, StartupPhaseRecord, address, directories (+4 more)

### Community 75 - "ManagerMessage"
Cohesion: 0.17
Nodes (11): confirmationSchema, defaultsSchema, editSchema, effort, ManagerRouteAgent, messageParams, registerManagerRoutes(), sendSchema (+3 more)

### Community 76 - "session-clear-transcript.test.ts"
Cohesion: 0.11
Nodes (9): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions, disk, fixtures, gate(), holdTurnWrite() (+1 more)

### Community 77 - "workspace-browser.ts"
Cohesion: 0.19
Nodes (17): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+9 more)

### Community 78 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 79 - "session-reply-durability.test.ts"
Cohesion: 0.16
Nodes (16): answer(), assistantFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRequest(), copilotRunFixture() (+8 more)

### Community 80 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 81 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 82 - "recordValue"
Cohesion: 0.18
Nodes (19): attachmentModeValue(), backgroundHandoff(), booleanValue(), eventString(), lastForegroundCompletionAt(), normalizedToolName(), notificationKind(), parsedValue() (+11 more)

### Community 83 - "session-resource-providers.test.ts"
Cohesion: 0.11
Nodes (15): ClaudeSdk, cleanupFixtures(), directories, queryHandle(), services, waitForIdle(), ClaudeMcpRead, deferred() (+7 more)

### Community 84 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 85 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (8): claude(), clearFixture(), copilot(), disk, event(), fixtures, releases, sdkSession()

### Community 86 - "react"
Cohesion: 0.13
Nodes (11): plugins, oxc, react, typescript, MarkdownCodeBlock(), copy(), originalClipboard, drawDiagram() (+3 more)

### Community 87 - "NodeIdentityStore"
Cohesion: 0.18
Nodes (4): ComputerRegistry, directories, remoteSnapshotFixture(), NodeIdentityStore

### Community 88 - "event-log.ts"
Cohesion: 0.22
Nodes (16): appendLines(), cacheKey(), copilotHome(), eventLogPath(), ParsedLog, parsedLogs, readAt(), readSessionEvents() (+8 more)

### Community 89 - "use-session-knowledge-root.ts"
Cohesion: 0.19
Nodes (12): getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey(), knowledgePositionForBinding(), SessionIdentity (+4 more)

### Community 90 - "backgroundTasksFromEvents"
Cohesion: 0.27
Nodes (17): addActivity(), backgroundTasksFromEvents(), boundedText(), errorValue(), eventTask(), executionModeValue(), isTerminalTaskStatus(), mergeShellRefresh() (+9 more)

### Community 91 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 92 - "terminal-form-deadline.test.ts"
Cohesion: 0.15
Nodes (12): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+4 more)

### Community 93 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 94 - "background-task-stop.test.ts"
Cohesion: 0.23
Nodes (12): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), started() (+4 more)

### Community 95 - "queued-dispatch.test.ts"
Cohesion: 0.14
Nodes (8): accept(), deferred(), disk, fixtures, holdWrite(), prompt(), releases, target

### Community 96 - "BackgroundTasksDialog.tsx"
Cohesion: 0.22
Nodes (11): BackgroundTask, DialogFrame(), BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel() (+3 more)

### Community 97 - "NewSessionDialog"
Cohesion: 0.22
Nodes (15): activateSession(), createSession(), listDirectories(), listHistory(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), computerProviders() (+7 more)

### Community 98 - "check-workspace-review-regressions.ts"
Cohesion: 0.15
Nodes (11): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+3 more)

### Community 99 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 100 - "registerSessionKnowledgeRoutes"
Cohesion: 0.30
Nodes (11): registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession(), recordReplacement() (+3 more)

### Community 101 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 102 - "promotion-monitor.test.ts"
Cohesion: 0.27
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 103 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 104 - "session-response-order.ts"
Cohesion: 0.27
Nodes (11): sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), currentSessionEventSequence(), nextSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences (+3 more)

### Community 105 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+4 more)

### Community 106 - "session-knowledge-routes.test.ts"
Cohesion: 0.18
Nodes (9): ServerRole, SessionMetadataLookup, disk, FakeManager, fixtures, gate(), holdWrite(), releases (+1 more)

### Community 107 - "background-task-tracker.ts"
Cohesion: 0.27
Nodes (6): snapshot(), backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint()

### Community 108 - "recovery-seed-guards.test.ts"
Cohesion: 0.18
Nodes (8): bootLegacy(), directories, execute, pending, releases, SeedState, services, stores

### Community 109 - "OracleSettings.tsx"
Cohesion: 0.29
Nodes (10): getManager(), updateManagerSettings(), setup(), effortFrom(), efforts, OracleSettings(), save(), saveFolder() (+2 more)

### Community 110 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 111 - "server/side-question.ts"
Cohesion: 0.27
Nodes (8): SIDE_QUESTION_CLEANUP_MS, SIDE_QUESTION_RUNTIME_IDLE_MS, SIDE_QUESTION_TIMEOUT_MS, sideQuestionBoundary(), sideQuestionPrompt(), SIDE_QUESTION_EARLIER_ANSWER_MAX_LENGTH, SIDE_QUESTION_EARLIER_LIMIT, SIDE_QUESTION_MAX_LENGTH

### Community 112 - ".oxlintrc.json"
Cohesion: 0.20
Nodes (9): ignorePatterns, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/**, graphify/.venv/** (+1 more)

### Community 113 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 115 - "BackgroundTaskSnapshot"
Cohesion: 0.27
Nodes (3): hasActiveBackgroundTasks(), hasRunningBackgroundAgent(), BackgroundTaskSnapshot

### Community 116 - "session-enqueue-clear.test.ts"
Cohesion: 0.29
Nodes (9): disk, EnqueueCase, fixtures, gate(), holdEnqueue(), joinedEnqueue(), quiet(), releases (+1 more)

### Community 117 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 118 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 119 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 120 - "voice-recorder.ts"
Cohesion: 0.28
Nodes (3): recordingDuration(), FakeRecorder, useVoiceRecorder()

### Community 121 - "KnowledgePosition"
Cohesion: 0.36
Nodes (4): WorkspaceFixtureOptions, KnowledgePosition, KnowledgeRestoreState, base

### Community 122 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, packageManager, private, type, version

### Community 124 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 125 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 126 - "render-workspace-gifs.ts"
Cohesion: 0.29
Nodes (6): directory, { values }, workflows, pnpm, onlyBuiltDependencies, ffmpeg-static

### Community 127 - "recovery-context.ts"
Cohesion: 0.38
Nodes (4): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief

### Community 128 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 129 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 130 - "usePanelWidth"
Cohesion: 0.47
Nodes (6): boundWidth(), readWidth(), storeWidth(), usePanelWidth(), commit(), finish()

### Community 133 - "removeComputer"
Cohesion: 0.60
Nodes (5): addComputer(), removeComputer(), ComputersDialog(), remove(), submit()

## Knowledge Gaps
- **735 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+730 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1140 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **23 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `SessionStore`, `claude-agent-service.ts`, `agent-service.ts`, `.get`, `SessionDetail`, `session-resource-routes.test.ts`, `.startAdmitted`, `queued-provider-dispatch.test.ts`, `session-resources.ts`, `background-task-adapter.ts`, `.sendInternal`, `SessionFileUpload`, `session-store.ts`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `buildApp()` connect `app.ts` to `SessionStore`, `AgentService`, `ClaudeAgentService`, `ManagerAgent`, `ComputerManager`, `manager-store.ts`, `SessionService`, `ProviderSessionService`, `node-routes.ts`, `SessionKnowledgeStore`, `SessionOrderStore`, `delegated-transcription-service.ts`, `KnowledgeStore`, `cli-canary.ts`, `ManagerStore`, `transcription-service.ts`, `PushNotificationService`, `ManagerMessage`, `NodeIdentityStore`, `TranscriptionError`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionStore` to `AgentService`, `ClaudeAgentService`, `agent-service.ts`, `.get`, `SessionDetail`, `.startAdmitted`, `queued-provider-dispatch.test.ts`, `SessionFileUpload`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _735 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.0391410134348884 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0236152855302705 - nodes in this community are weakly interconnected._
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
