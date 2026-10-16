# Agentic Remote - Graphify code map

Snapshot: `8e2f842f57a2bb0844f1f397b6af7225f0df40ae5cc313aacd5f0de3b4bd1764`

Source checkout: `15e932417ec2922d2ae7fcfbd8de11057c308940`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 268 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 268 files · ~549,045 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 4125 nodes · 11687 edges · 160 communities (124 shown, 21 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 802 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- SessionDetail
- App
- App.tsx
- api.ts
- ClaudeAgentService
- agent-service.ts
- terminal-session.ts
- agentic-remote-promotion-monitor
- session-presentation.ts
- session-resources.ts
- agent-service.test.ts
- active-sessions.ts
- contracts.ts
- queued-dispatch.test.ts
- claude-agent-service.ts
- manager-agent.ts
- ManagerAgent
- manager-tools.ts
- TmuxTerminalSessionController
- SessionService
- ComputerManager
- RemoteNodeClient
- ManagerAssistant.tsx
- markdown-navigation.ts
- bundle
- ProviderSessionService
- terminal-startup-queue.test.ts
- lib.rs
- shell.ts
- hub-routes.ts
- agentic-remote-promotion-setup
- config.rs
- workspace-fixtures.ts
- FakeSessionService
- knowledge-tree.ts
- pwa.ts
- devDependencies
- SessionKnowledgeStore
- terminal-session.test.ts
- agentic-remote
- dependencies
- node-routes.ts
- manager-store.ts
- KnowledgeStore
- .isRetiredSession
- SessionOrderStore
- delegated-transcription-service.ts
- session-enqueue-clear.test.ts
- app.ts
- background-task-adapter.ts
- .sendInternal
- cli-canary.ts
- scripts
- UserInputReplyInput
- directory-browser.ts
- transcription-service.ts
- compilerOptions
- ManagerStore
- ManagedSession
- PromptCards.tsx
- capture-workspace.ts
- PushNotificationService
- session-resource-clear.test.ts
- session-store-providers.test.ts
- HubEvent
- ComputerSummary
- startup-phases.test.ts
- session-knowledge-store.ts
- compilerOptions
- ManagerMessage
- session-reply-durability.test.ts
- compilerOptions
- compilerOptions
- recordValue
- ManagerMemory
- workspace-browser.ts
- react
- NodeIdentityStore
- event-log.ts
- manager-context.ts
- use-session-knowledge-root.ts
- backgroundTasksFromEvents
- session-clear-transcript.test.ts
- ReaderWorkspace
- terminal-form-deadline.test.ts
- recovery-resend-durability.test.ts
- session-resource-routes.test.ts
- background-task-stop.test.ts
- BackgroundTasksDialog.tsx
- check-workspace-review-regressions.ts
- desktop.json
- registerSessionKnowledgeRoutes
- normalizeKnowledgeRelativePath
- .oxlintrc.json
- settings-local.json
- .askSession
- promotion-monitor.test.ts
- TranscriptionError
- session-response-order.ts
- scripts
- session-knowledge-routes.test.ts
- background-task-tracker.ts
- html-preview.ts
- session-knowledge-routes.ts
- server/side-question.ts
- OracleSettings.tsx
- generate-pwa-icons.ts
- DeferredSession
- bridge.rs
- screenshot-stability.test.ts
- promotion-setup-execution.test.ts
- remote-node-client.test.ts
- submission-error.ts
- session-store-durability.test.ts
- KnowledgePosition
- package.json
- SessionFileUpload
- release-publication.test.ts
- UserInputFieldControl
- render-workspace-gifs.ts
- settings.ts
- composer-layout.test.ts
- usePanelWidth
- MarkdownCodeBlock.tsx
- removeComputer
- KnowledgeRootChoices.test.tsx
- FakeRecorder
- terminal-send-uncertainty.test.ts
- MockMediaRecorder
- ManagerEventSource
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

## Communities (160 total, 21 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.04
Nodes (13): agentMode(), AgentService, commandShortcut(), isMissingSessionError(), isUncertainDelivery(), removeCopilotSessionFiles(), RuntimeConfigurationError, stripAnsi() (+5 more)

### Community 1 - "SessionDetail"
Cohesion: 0.04
Nodes (57): fixture(), restart(), connect(), createStore(), deferred(), disk, enqueue(), fixture() (+49 more)

### Community 2 - "App"
Cohesion: 0.04
Nodes (130): submissionReceiptFromError(), askSession(), activeComposerPastes(), App(), adoptConversationReplacement(), appendComposerForKey(), appKeyDown(), applyComputerSnapshot() (+122 more)

### Community 3 - "App.tsx"
Cohesion: 0.02
Nodes (115): isManagerEvent(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph() (+107 more)

### Community 4 - "api.ts"
Cohesion: 0.04
Nodes (118): parseSubmissionReceipt(), activateSession(), addKnowledgeRoot(), bootstrapSessionOrder(), cancelBackgroundTask(), cancelSession(), clearConversation(), configureRuntime() (+110 more)

### Community 5 - "ClaudeAgentService"
Cohesion: 0.05
Nodes (18): ClaudeAgentService, isMissingClaudeSessionError(), claudeFixture(), claudeFixture(), ClaudeMcpRead, copilotFixture(), deferred(), directory() (+10 more)

### Community 6 - "agent-service.ts"
Cohesion: 0.05
Nodes (67): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, AgentServiceEvents (+59 more)

### Community 7 - "terminal-session.ts"
Cohesion: 0.05
Nodes (78): activeBottomFrame(), boxedComposerFrame(), captureTerminal(), cleanDialogLine(), clearAutomaticStartupPrompts(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFrameText() (+70 more)

### Community 8 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (71): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+63 more)

### Community 9 - "session-presentation.ts"
Cohesion: 0.05
Nodes (57): saveSessionOrderLane(), handleDragEnd(), KnowledgeRootSelector(), root, reorderSessionLaneWithHiddenFollowers(), SessionFilter, sessionNavigationView, computers (+49 more)

### Community 10 - "session-resources.ts"
Cohesion: 0.09
Nodes (45): ClaudeResources, releases, session, snapshot, claudeMcp(), claudeSkillNames(), copilotMcp, copilotSkills (+37 more)

### Community 11 - "agent-service.test.ts"
Cohesion: 0.04
Nodes (39): CopilotClientLike, CopilotSessionLike, foregroundTurnOpen(), holdProbe(), fixtures, gate(), releases, directories (+31 more)

### Community 12 - "active-sessions.ts"
Cohesion: 0.06
Nodes (50): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+42 more)

### Community 13 - "contracts.ts"
Cohesion: 0.05
Nodes (46): managers, releases, remote, RemoteResync, RemoteSessionRead, RegistryState, StoredNodeIdentity, BriefMessage (+38 more)

### Community 14 - "queued-dispatch.test.ts"
Cohesion: 0.06
Nodes (28): acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight(), preparePrompt(), QueuedDelivery (+20 more)

### Community 15 - "claude-agent-service.ts"
Cohesion: 0.06
Nodes (29): AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission, PendingClaudeReply (+21 more)

### Community 16 - "manager-agent.ts"
Cohesion: 0.06
Nodes (29): isPending(), isQueued(), ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig, Rung, Behavior (+21 more)

### Community 17 - "ManagerAgent"
Cohesion: 0.10
Nodes (11): checkContent(), delay(), discover(), errorMessage(), isNotFound(), ManagerAgent, sameRuntime(), TurnError (+3 more)

### Community 18 - "manager-tools.ts"
Cohesion: 0.07
Nodes (28): APPROVE_WORDS, computerField, createManagerTools(), define(), deliver(), requireComputer(), resolveSession(), trustFolder() (+20 more)

### Community 19 - "TmuxTerminalSessionController"
Cohesion: 0.11
Nodes (15): copilotCommand(), endProbeSession(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand(), safeWindowName(), submitTerminalForm() (+7 more)

### Community 20 - "SessionService"
Cohesion: 0.08
Nodes (6): ActiveClaudeQuery, registerNodeRoutes(), readServiceResources(), ResourceReads, resourceRequestHandler(), SessionService

### Community 21 - "ComputerManager"
Cohesion: 0.17
Nodes (4): ComputerManager, managedSession(), registerHubRoutes(), ManagedRemovedQueuedPrompt

### Community 22 - "RemoteNodeClient"
Cohesion: 0.06
Nodes (7): RemoteNodeClient, BackgroundTaskSnapshot, RemovedQueuedPrompt, WorkspaceFile, WorkspaceListing, KnowledgeFolderState, WorkspaceFileIcon()

### Community 23 - "ManagerAssistant.tsx"
Cohesion: 0.08
Nodes (33): ManagerSessionRef, cancelManager(), editQueuedManagerMessage(), removeQueuedManagerMessage(), resetManager(), resolveManagerConfirmation(), retryManagerMessage(), sendManagerMessage() (+25 more)

### Community 24 - "markdown-navigation.ts"
Cohesion: 0.09
Nodes (37): executeCommand(), readWorkspaceFile(), ChangeDirectoryDialog(), submit(), followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), MarkdownImage() (+29 more)

### Community 25 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 27 - "terminal-startup-queue.test.ts"
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

### Community 34 - "FakeSessionService"
Cohesion: 0.08
Nodes (5): FakeSessionService, routingFixture(), session(), temporaryDirectory(), SideQuestionExchange

### Community 35 - "knowledge-tree.ts"
Cohesion: 0.09
Nodes (34): WorkspaceEntry, listKnowledgeEntries(), readKnowledgeFile(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor() (+26 more)

### Community 36 - "pwa.ts"
Cohesion: 0.11
Nodes (33): deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate(), toggle() (+25 more)

### Community 37 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 38 - "SessionKnowledgeStore"
Cohesion: 0.12
Nodes (11): bindingKey(), SessionKnowledgeConflictError, SessionKnowledgeRecoveryError, SessionKnowledgeStore, stateWithPaths(), disk, fixture(), fixtures (+3 more)

### Community 39 - "terminal-session.test.ts"
Cohesion: 0.08
Nodes (29): composerHoldsOtherText(), composerTookPaste(), occurrences(), paneEvidenceCount(), paneShowsText(), parseTerminalUpdateNotice(), pasteCouldCollapse(), pastedPlaceholderCount() (+21 more)

### Community 40 - "agentic-remote"
Cohesion: 0.13
Nodes (31): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+23 more)

### Community 41 - "dependencies"
Cohesion: 0.06
Nodes (33): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, @fastify/multipart, @fastify/static, @fastify/websocket, lucide-react (+25 more)

### Community 42 - "node-routes.ts"
Cohesion: 0.07
Nodes (28): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile(), AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER (+20 more)

### Community 43 - "manager-store.ts"
Cohesion: 0.12
Nodes (17): ManagerAgentOptions, JournalRecorder, JournalRecorderOptions, Seen, sessionTask(), JournalDraft, JournalEntry, JournalKind (+9 more)

### Community 44 - "KnowledgeStore"
Cohesion: 0.13
Nodes (9): WorkspaceFixtureState, SessionMuteCarrier, KnowledgeRootReservation, KnowledgeState, KnowledgeStore, directories, fixture(), createHub() (+1 more)

### Community 45 - ".isRetiredSession"
Cohesion: 0.13
Nodes (3): normalizedTitle(), httpBoundary(), StartupPhases

### Community 46 - "SessionOrderStore"
Cohesion: 0.15
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 47 - "delegated-transcription-service.ts"
Cohesion: 0.11
Nodes (14): BuildAppOptions, collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation (+6 more)

### Community 48 - "session-enqueue-clear.test.ts"
Cohesion: 0.09
Nodes (23): ClaudeSdk, cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle(), deferred() (+15 more)

### Community 49 - "app.ts"
Cohesion: 0.12
Nodes (18): prefixes, session, trusted, untrusted, directories, buildApp(), errorStatusCode(), isAppleTouchIconProbe() (+10 more)

### Community 50 - "background-task-adapter.ts"
Cohesion: 0.10
Nodes (24): BackgroundTaskEventOptions, CopilotClientTaskInfo, CopilotClientTaskProgress, CopilotTaskInfo, CopilotTaskProgress, isBackgroundTaskInfo(), isBackgroundTaskProgress(), isLiveTaskStatus() (+16 more)

### Community 51 - ".sendInternal"
Cohesion: 0.17
Nodes (16): capturePane(), composerFocusWitnessed(), composerHoldsText(), composerText(), hasComposerAfter(), hasLiveTerminalComposer(), isTerminalAgentWorking(), isTerminalOverlay() (+8 more)

### Community 52 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 53 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 54 - "UserInputReplyInput"
Cohesion: 0.16
Nodes (6): persistedFormAnswer(), TerminalFormContinuation, validateUserInputForm(), TerminalFormReplyError, UserInputReplyInput, SubmissionError

### Community 55 - "directory-browser.ts"
Cohesion: 0.17
Nodes (13): DirectoryScope, displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin() (+5 more)

### Community 56 - "transcription-service.ts"
Cohesion: 0.10
Nodes (20): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+12 more)

### Community 57 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 58 - "ManagerStore"
Cohesion: 0.15
Nodes (4): openStore(), emptyState(), ManagerStore, open()

### Community 59 - "ManagedSession"
Cohesion: 0.17
Nodes (5): RemoteSessionListing, ManagerHub, TurnContextInput, ManagedSession, SessionListing

### Community 60 - "PromptCards.tsx"
Cohesion: 0.13
Nodes (16): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+8 more)

### Community 61 - "capture-workspace.ts"
Cohesion: 0.19
Nodes (21): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+13 more)

### Community 62 - "PushNotificationService"
Cohesion: 0.25
Nodes (3): brief(), PushNotificationService, registerPushRoutes()

### Community 63 - "session-resource-clear.test.ts"
Cohesion: 0.12
Nodes (19): apps, directories, directory(), obstructUploads(), pairedFixture(), providers, seed(), sockets (+11 more)

### Community 64 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (10): claude(), clearFixture(), copilot(), disk, event(), fixture(), fixtures, releases (+2 more)

### Community 65 - "HubEvent"
Cohesion: 0.11
Nodes (13): WorkspaceFixture, ComputerManagerEvents, HubEventSource, PushSender, PushState, directories, RFC-8030, RFC-8030 (+5 more)

### Community 66 - "ComputerSummary"
Cohesion: 0.18
Nodes (5): fixture(), session(), sessionAtLeastAsNew(), RegisteredComputer, ComputerSummary

### Community 67 - "startup-phases.test.ts"
Cohesion: 0.12
Nodes (12): phases, port, createStartupPhases(), startManagedServer(), StartupPhaseEvent, StartupPhaseRecord, address, directories (+4 more)

### Community 68 - "session-knowledge-store.ts"
Cohesion: 0.10
Nodes (19): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+11 more)

### Community 69 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 70 - "ManagerMessage"
Cohesion: 0.17
Nodes (11): confirmationSchema, defaultsSchema, editSchema, effort, ManagerRouteAgent, messageParams, registerManagerRoutes(), sendSchema (+3 more)

### Community 71 - "session-reply-durability.test.ts"
Cohesion: 0.16
Nodes (16): answer(), assistantFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRequest(), copilotRunFixture() (+8 more)

### Community 72 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 73 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 74 - "recordValue"
Cohesion: 0.18
Nodes (19): attachmentModeValue(), backgroundHandoff(), booleanValue(), eventString(), lastForegroundCompletionAt(), normalizedToolName(), notificationKind(), parsedValue() (+11 more)

### Community 75 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 76 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 77 - "react"
Cohesion: 0.14
Nodes (8): react, drawDiagram(), drawing, MermaidDiagram(), SessionActions(), recordingDuration(), FakeRecorder, useVoiceRecorder()

### Community 78 - "NodeIdentityStore"
Cohesion: 0.18
Nodes (4): ComputerRegistry, directories, remoteSnapshotFixture(), NodeIdentityStore

### Community 79 - "event-log.ts"
Cohesion: 0.22
Nodes (16): appendLines(), cacheKey(), copilotHome(), eventLogPath(), ParsedLog, parsedLogs, readAt(), readSessionEvents() (+8 more)

### Community 80 - "manager-context.ts"
Cohesion: 0.21
Nodes (14): ago(), attentionRank(), buildTurnContext(), changeLines(), clock(), MANAGER_SYSTEM_PROMPT, managerPrompt(), oneLine() (+6 more)

### Community 81 - "use-session-knowledge-root.ts"
Cohesion: 0.19
Nodes (12): getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey(), knowledgePositionForBinding(), SessionIdentity (+4 more)

### Community 82 - "backgroundTasksFromEvents"
Cohesion: 0.27
Nodes (17): addActivity(), backgroundTasksFromEvents(), boundedText(), errorValue(), eventTask(), executionModeValue(), isTerminalTaskStatus(), mergeShellRefresh() (+9 more)

### Community 83 - "session-clear-transcript.test.ts"
Cohesion: 0.14
Nodes (6): SessionAdmissions, disk, fixtures, gate(), holdTurnWrite(), releases

### Community 84 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 85 - "terminal-form-deadline.test.ts"
Cohesion: 0.15
Nodes (12): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+4 more)

### Community 86 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 87 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 88 - "background-task-stop.test.ts"
Cohesion: 0.23
Nodes (12): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), started() (+4 more)

### Community 89 - "BackgroundTasksDialog.tsx"
Cohesion: 0.22
Nodes (11): BackgroundTask, DialogFrame(), BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel() (+3 more)

### Community 90 - "check-workspace-review-regressions.ts"
Cohesion: 0.15
Nodes (11): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+3 more)

### Community 91 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 92 - "registerSessionKnowledgeRoutes"
Cohesion: 0.30
Nodes (11): registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession(), recordReplacement() (+3 more)

### Community 93 - "normalizeKnowledgeRelativePath"
Cohesion: 0.35
Nodes (11): joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath(), slashPath(), scopedKnowledgeRoot(), KnowledgeRootChoice (+3 more)

### Community 94 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 95 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 96 - ".askSession"
Cohesion: 0.23
Nodes (3): forgetSessionEvents(), SideQuestionError, withSideQuestionTimeout()

### Community 97 - "promotion-monitor.test.ts"
Cohesion: 0.27
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 98 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 99 - "session-response-order.ts"
Cohesion: 0.27
Nodes (11): sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), currentSessionEventSequence(), nextSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences (+3 more)

### Community 100 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+4 more)

### Community 101 - "session-knowledge-routes.test.ts"
Cohesion: 0.18
Nodes (9): ServerRole, SessionMetadataLookup, disk, FakeManager, fixtures, gate(), holdWrite(), releases (+1 more)

### Community 102 - "background-task-tracker.ts"
Cohesion: 0.27
Nodes (6): snapshot(), backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint()

### Community 103 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 104 - "session-knowledge-routes.ts"
Cohesion: 0.18
Nodes (6): Lineage, RegistrationGeneration, ReplacementEvidence, SessionKnowledgeLifecycle, sessionParams, updateSchema

### Community 105 - "server/side-question.ts"
Cohesion: 0.27
Nodes (8): SIDE_QUESTION_CLEANUP_MS, SIDE_QUESTION_RUNTIME_IDLE_MS, SIDE_QUESTION_TIMEOUT_MS, sideQuestionBoundary(), sideQuestionPrompt(), SIDE_QUESTION_EARLIER_ANSWER_MAX_LENGTH, SIDE_QUESTION_EARLIER_LIMIT, SIDE_QUESTION_MAX_LENGTH

### Community 106 - "OracleSettings.tsx"
Cohesion: 0.33
Nodes (9): getManager(), updateManagerSettings(), effortFrom(), efforts, OracleSettings(), save(), saveFolder(), update() (+1 more)

### Community 107 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 109 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 110 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 111 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 112 - "remote-node-client.test.ts"
Cohesion: 0.28
Nodes (5): client(), servers, session, TERMINAL_REQUEST_TIMEOUT_MS, TERMINAL_STARTUP_TIMEOUT_MS

### Community 113 - "submission-error.ts"
Cohesion: 0.36
Nodes (5): RemoteNodeRedirectError, RemoteNodeRequestError, httpDeliveryUncertain(), legacyDefinitiveHttpRefusals, SubmissionReceipt

### Community 114 - "session-store-durability.test.ts"
Cohesion: 0.31
Nodes (7): disk, fixture(), fixtures, prompt(), ready(), releases, session()

### Community 115 - "KnowledgePosition"
Cohesion: 0.36
Nodes (4): WorkspaceFixtureOptions, KnowledgePosition, KnowledgeRestoreState, base

### Community 116 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, packageManager, private, type, version

### Community 118 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 119 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 120 - "render-workspace-gifs.ts"
Cohesion: 0.29
Nodes (6): directory, { values }, workflows, pnpm, onlyBuiltDependencies, ffmpeg-static

### Community 121 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 122 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 123 - "usePanelWidth"
Cohesion: 0.47
Nodes (6): boundWidth(), readWidth(), storeWidth(), usePanelWidth(), commit(), finish()

### Community 124 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 125 - "removeComputer"
Cohesion: 0.60
Nodes (5): addComputer(), removeComputer(), ComputersDialog(), remove(), submit()

### Community 126 - "KnowledgeRootChoices.test.tsx"
Cohesion: 0.40
Nodes (4): actions, computers, root, session

## Knowledge Gaps
- **735 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+730 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1140 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `.askSession`, `agent-service.ts`, `session-resources.ts`, `.isRetiredSession`, `queued-dispatch.test.ts`, `background-task-adapter.ts`, `.sendInternal`, `SessionFileUpload`, `UserInputReplyInput`, `directory-browser.ts`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `buildApp()` connect `app.ts` to `AgentService`, `SessionDetail`, `ClaudeAgentService`, `ManagerAgent`, `SessionService`, `ComputerManager`, `ProviderSessionService`, `SessionKnowledgeStore`, `node-routes.ts`, `manager-store.ts`, `KnowledgeStore`, `SessionOrderStore`, `delegated-transcription-service.ts`, `cli-canary.ts`, `transcription-service.ts`, `ManagerStore`, `PushNotificationService`, `ManagerMessage`, `NodeIdentityStore`, `TranscriptionError`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionDetail` to `AgentService`, `session-store-providers.test.ts`, `ClaudeAgentService`, `agent-service.ts`, `.isRetiredSession`, `SessionFileUpload`, `UserInputReplyInput`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _735 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.04047175667287399 - nodes in this community are weakly interconnected._
- **Should `SessionDetail` be split into smaller, more focused modules?**
  _Cohesion score 0.039594208608293116 - nodes in this community are weakly interconnected._
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
