# Agentic Remote - Graphify code map

Snapshot: `8dc28fcd261fa5ce49a90d8dddb5af7a442ebaf78f5e8e275cc8d91c720d0391`

Source checkout: `7a4b025a5fe74da59a571d4cca44dac05a089088`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 240 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 240 files · ~496,776 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3662 nodes · 10351 edges · 150 communities (113 shown, 22 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 758 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App
- SessionDetail
- api.ts
- App.tsx
- ComputerManager
- AgentService
- contracts.ts
- claude-agent-service.ts
- .get
- agent-service.ts
- agentic-remote-promotion-monitor
- terminal-session.ts
- session-presentation.ts
- markdown-navigation.ts
- session-knowledge-store.ts
- ClaudeAgentService
- TmuxTerminalSessionController
- tmux-errors.integration.test.ts
- RemoteNodeClient
- ProviderSessionService
- bundle
- FakeSessionService
- lib.rs
- pwa.ts
- shell.ts
- session-knowledge-routes.test.ts
- config.rs
- queued-dispatch.test.ts
- background-task-adapter.ts
- session-enqueue-clear.test.ts
- agent-service.test.ts
- hub-routes.ts
- devDependencies
- agentic-remote
- dependencies
- agentic-remote-promotion-setup
- active-sessions.ts
- sessionKey
- delegated-transcription-service.ts
- SessionOrderStore
- node-routes.ts
- PushNotificationService
- KnowledgeStore
- app.ts
- session-reply-durability.test.ts
- cli-canary.ts
- terminal-startup-queue.test.ts
- terminal-session.test.ts
- scripts
- .publishError
- .replyUserInputInternal
- compilerOptions
- CopilotClientLike
- transcription-service.ts
- capture-workspace.ts
- isTerminalComposerFooter
- normalizeKnowledgeRelativePath
- session-clear-transcript.test.ts
- .sendInternal
- PromptCards.tsx
- knowledge-tree.ts
- compilerOptions
- .isRetiredSession
- .runQuery
- recordValue
- compilerOptions
- check-workspace-review-regressions.ts
- compilerOptions
- server/side-question.ts
- session-store-providers.test.ts
- workspace-browser.ts
- session-resource-providers.test.ts
- directory-browser.ts
- api.test.ts
- ReaderWorkspace
- NewSessionDialog
- recovery-resend-durability.test.ts
- session-resource-routes.test.ts
- background-task-stop.test.ts
- .dispatchAdmitted
- desktop.json
- registerSessionKnowledgeRoutes
- BackgroundTasksDialog.tsx
- capture-workbench-review.ts
- workspace-fixtures.ts
- settings-local.json
- background-task-tracker.ts
- TranscriptionError
- scripts
- conversation-recovery.test.ts
- claude-agent-service.test.ts
- promotion-monitor.test.ts
- push-notification-service.ts
- queued-provider-dispatch.test.ts
- recovery-seed-guards.test.ts
- session-resource-clear.test.ts
- html-preview.ts
- session-knowledge-routes.ts
- setupWorkspaceFixture
- .oxlintrc.json
- generate-pwa-icons.ts
- session-resource-transport.ts
- bridge.rs
- screenshot-stability.test.ts
- KnowledgePosition
- remote-node-client.test.ts
- tmux-errors.test.ts
- package.json
- SessionFileUpload
- RuntimeModelOption
- release-publication.test.ts
- render-workspace-gifs.ts
- recovery-context.ts
- settings.ts
- composer-layout.test.ts
- MarkdownCodeBlock.tsx
- removeComputer
- .discoverTerminalSessions
- promotion-setup-execution.test.ts
- MermaidDiagram.tsx
- version-policy.test.ts
- queued-commands.ts
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
2. `App()` - 255 edges
3. `AgentService` - 231 edges
4. `SessionStore` - 158 edges
5. `ClaudeAgentService` - 118 edges
6. `ComputerManager` - 81 edges
7. `registerHubRoutes()` - 76 edges
8. `SessionService` - 71 edges
9. `RemoteNodeClient` - 66 edges
10. `TmuxTerminalSessionController` - 64 edges

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

## Communities (150 total, 22 thin omitted)

### Community 0 - "App"
Cohesion: 0.03
Nodes (148): listKnowledgeEntries(), readKnowledgeFile(), recoverConversation(), removeQueuedPrompt(), saveSessionVisibility(), transcribeAudio(), uploadSessionFile(), activeComposerPastes() (+140 more)

### Community 1 - "SessionDetail"
Cohesion: 0.04
Nodes (52): fixture(), fixture(), PendingClaudeReply, connect(), createStore(), enqueue(), fixture(), recoveryFixture() (+44 more)

### Community 2 - "api.ts"
Cohesion: 0.03
Nodes (106): AddKnowledgeRootInput, PushSettings, httpDeliveryUncertain(), legacyDefinitiveHttpRefusals, parseSubmissionReceipt(), submissionReceiptFromError(), addKnowledgeRoot(), bootstrapSessionOrder() (+98 more)

### Community 3 - "App.tsx"
Cohesion: 0.03
Nodes (101): ActivityStatus, AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph() (+93 more)

### Community 4 - "ComputerManager"
Cohesion: 0.06
Nodes (23): ActiveClaudeQuery, ComputerManager, managedSession(), RemoteSessionListing, RemoteSessionRead, sessionAtLeastAsNew(), SessionMetadataLookup, RegisteredComputer (+15 more)

### Community 5 - "AgentService"
Cohesion: 0.05
Nodes (9): AgentService, foregroundTurnOpen(), isForegroundCompletionEvent(), isForegroundLifecycleEvent(), isMissingSessionError(), RuntimeConfigurationError, statusFromEvents(), fixture() (+1 more)

### Community 6 - "contracts.ts"
Cohesion: 0.05
Nodes (40): ClaudeAgentServiceEvents, DirectoryScope, directories, ProviderSessionServiceEvents, DEFINITE_DISPATCH_REFUSALS, normalizeNodeUrl(), REDIRECT_STATUSES, RemoteNodeClientEvents (+32 more)

### Community 7 - "claude-agent-service.ts"
Cohesion: 0.07
Nodes (55): AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, PendingClaudeInput, PendingClaudePermission, RemoteNodeRedirectError, RemoteNodeRequestError (+47 more)

### Community 8 - ".get"
Cohesion: 0.08
Nodes (7): isUncertainDelivery(), queueConflict(), isTerminalAgentWorking(), isTerminalVisiblyIdle(), TerminalSessionController, deliveryUncertaintyFromError(), SubmissionError

### Community 9 - "agent-service.ts"
Cohesion: 0.06
Nodes (65): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, AgentServiceEvents (+57 more)

### Community 10 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (67): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+59 more)

### Community 11 - "terminal-session.ts"
Cohesion: 0.07
Nodes (63): activeBottomFrame(), cleanDialogLine(), clearAutomaticStartupPrompts(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFocusWitnessed(), containsCopiedInteractiveFrame(), desktopInstallPromptIdentity() (+55 more)

### Community 12 - "session-presentation.ts"
Cohesion: 0.06
Nodes (54): plugins, oxc, react, typescript, saveSessionOrderLane(), handleDragEnd(), KnowledgeRootSelector(), root (+46 more)

### Community 13 - "markdown-navigation.ts"
Cohesion: 0.07
Nodes (44): executeCommand(), listWorkspace(), moveSessionToBrowsedFolder(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink(), KnowledgeReader() (+36 more)

### Community 14 - "session-knowledge-store.ts"
Cohesion: 0.07
Nodes (30): bindingKey(), bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor() (+22 more)

### Community 15 - "ClaudeAgentService"
Cohesion: 0.08
Nodes (3): ClaudeAgentService, isMissingClaudeSessionError(), toolResultText()

### Community 16 - "TmuxTerminalSessionController"
Cohesion: 0.10
Nodes (14): composer(), processAdapter, copilotCommand(), endProbeSession(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand() (+6 more)

### Community 17 - "tmux-errors.integration.test.ts"
Cohesion: 0.09
Nodes (37): exec, formFixture(), horizontalFormFixture(), textFieldFormFixture(), directories, exec, deliveryFixture(), execFileAsync (+29 more)

### Community 18 - "RemoteNodeClient"
Cohesion: 0.07
Nodes (8): RemoteResync, headerSafe(), RemoteNodeClient, BackgroundTaskSnapshot, NodeInfo, RemovedQueuedPrompt, WorkspaceFile, WorkspaceListing

### Community 20 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 21 - "FakeSessionService"
Cohesion: 0.06
Nodes (4): FakeSessionService, routingFixture(), session(), temporaryDirectory()

### Community 22 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 23 - "pwa.ts"
Cohesion: 0.10
Nodes (36): deletePushSubscription(), getProviderRuntimeOptions(), getPushPublicKey(), savePushSubscription(), sendTestPushNotification(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog() (+28 more)

### Community 24 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 25 - "session-knowledge-routes.test.ts"
Cohesion: 0.08
Nodes (19): ServerRole, fixture(), managers, releases, remote, session(), ComputerRegistry, RegistryState (+11 more)

### Community 26 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 27 - "queued-dispatch.test.ts"
Cohesion: 0.08
Nodes (20): errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight(), preparePrompt(), QueuedDispatches, QueuedDispatchTarget (+12 more)

### Community 28 - "background-task-adapter.ts"
Cohesion: 0.13
Nodes (35): addActivity(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), boundedText(), CopilotClientTaskInfo, CopilotClientTaskProgress, errorValue(), eventTask() (+27 more)

### Community 29 - "session-enqueue-clear.test.ts"
Cohesion: 0.07
Nodes (27): ClaudeSdk, deferred(), disk, fixtures, holdClaimWrite(), releases, deferred(), disk (+19 more)

### Community 30 - "agent-service.test.ts"
Cohesion: 0.08
Nodes (16): CopilotSessionLike, terminalFormSteps(), configurableModel(), DeferredSession, directories, FakeCopilotClient, probeService(), services (+8 more)

### Community 31 - "hub-routes.ts"
Cohesion: 0.06
Nodes (35): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+27 more)

### Community 32 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 33 - "agentic-remote"
Cohesion: 0.13
Nodes (31): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+23 more)

### Community 34 - "dependencies"
Cohesion: 0.06
Nodes (33): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, @fastify/multipart, @fastify/static, @fastify/websocket, lucide-react (+25 more)

### Community 35 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (30): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+22 more)

### Community 36 - "active-sessions.ts"
Cohesion: 0.14
Nodes (29): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+21 more)

### Community 37 - "sessionKey"
Cohesion: 0.10
Nodes (24): askSession(), getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), askSideQuestion(), closeSideQuestion(), failureStampFor() (+16 more)

### Community 38 - "delegated-transcription-service.ts"
Cohesion: 0.11
Nodes (14): BuildAppOptions, collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation (+6 more)

### Community 39 - "SessionOrderStore"
Cohesion: 0.15
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 40 - "node-routes.ts"
Cohesion: 0.07
Nodes (27): MAX_SESSION_FILE_BYTES, SessionParams, supportedExtensions, supportsSessionFile(), AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, configureRuntimeSchema, createSessionSchema (+19 more)

### Community 41 - "PushNotificationService"
Cohesion: 0.18
Nodes (4): brief(), HubEventSource, PushNotificationService, registerPushRoutes()

### Community 42 - "KnowledgeStore"
Cohesion: 0.16
Nodes (8): WorkspaceFixtureState, KnowledgeRootReservation, KnowledgeState, KnowledgeStore, directories, fixture(), createHub(), KnowledgeRoot

### Community 43 - "app.ts"
Cohesion: 0.12
Nodes (18): prefixes, session, trusted, untrusted, directories, buildApp(), errorStatusCode(), isAppleTouchIconProbe() (+10 more)

### Community 44 - "session-reply-durability.test.ts"
Cohesion: 0.13
Nodes (17): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRequest() (+9 more)

### Community 45 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 46 - "terminal-startup-queue.test.ts"
Cohesion: 0.13
Nodes (23): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+15 more)

### Community 47 - "terminal-session.test.ts"
Cohesion: 0.09
Nodes (21): paneEvidenceCount(), paneShowsText(), parseTerminalUpdateNotice(), bracketedTabPane, clearFixture(), desktopInstallPane, directories, downloadedUpdateFooter (+13 more)

### Community 48 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 49 - ".publishError"
Cohesion: 0.15
Nodes (3): agentMode(), hasActiveBackgroundTasks(), hasRunningBackgroundAgent()

### Community 50 - ".replyUserInputInternal"
Cohesion: 0.15
Nodes (6): persistedFormAnswer(), TerminalFormContinuation, validateUserInputForm(), TerminalFormReplyError, PendingUserInput, UserInputReplyInput

### Community 51 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 52 - "CopilotClientLike"
Cohesion: 0.09
Nodes (14): CopilotClientLike, holdProbe(), fixtures, gate(), releases, directories, fakeClient(), ForkRequest (+6 more)

### Community 53 - "transcription-service.ts"
Cohesion: 0.11
Nodes (19): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+11 more)

### Community 54 - "capture-workspace.ts"
Cohesion: 0.19
Nodes (21): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+13 more)

### Community 55 - "isTerminalComposerFooter"
Cohesion: 0.13
Nodes (20): boxedComposerFrame(), captureTerminal(), composerFrameText(), composerHasFocus(), composerRowText(), cursorComposerFrame(), DownloadedUpdateCell, downloadedUpdateFooterBlock() (+12 more)

### Community 56 - "normalizeKnowledgeRelativePath"
Cohesion: 0.19
Nodes (17): knowledgeFileSchema, scopedKnowledgePath(), joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath(), slashPath() (+9 more)

### Community 57 - "session-clear-transcript.test.ts"
Cohesion: 0.11
Nodes (9): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions, disk, fixtures, gate(), holdTurnWrite() (+1 more)

### Community 58 - ".sendInternal"
Cohesion: 0.19
Nodes (15): capturePane(), composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), isTerminalLoading(), isTerminalOverlay(), isTerminalSessionInUsePrompt() (+7 more)

### Community 59 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (19): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+11 more)

### Community 60 - "knowledge-tree.ts"
Cohesion: 0.17
Nodes (18): WorkspaceEntry, knowledgeTreeKeyDown(), toggleKnowledgeFolder(), collapseKnowledgeFolder(), expandKnowledgeFolder(), knowledgeAncestors(), KnowledgeCrumb, knowledgeCrumbs() (+10 more)

### Community 61 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 63 - ".runQuery"
Cohesion: 0.16
Nodes (8): isClaudeAuthenticationError(), acceptanceReceipt(), QueuedDelivery, accept(), unknownClaim(), queuedSdkPrompt(), disposals, fixture()

### Community 64 - "recordValue"
Cohesion: 0.17
Nodes (20): attachmentModeValue(), backgroundHandoff(), booleanValue(), eventString(), lastForegroundCompletionAt(), normalizedToolName(), notificationKind(), parsedValue() (+12 more)

### Community 65 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 66 - "check-workspace-review-regressions.ts"
Cohesion: 0.13
Nodes (15): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+7 more)

### Community 67 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 68 - "server/side-question.ts"
Cohesion: 0.20
Nodes (10): SIDE_QUESTION_CLEANUP_MS, SIDE_QUESTION_RUNTIME_IDLE_MS, SIDE_QUESTION_TIMEOUT_MS, sideQuestionBoundary(), SideQuestionError, sideQuestionPrompt(), withSideQuestionTimeout(), SIDE_QUESTION_EARLIER_ANSWER_MAX_LENGTH (+2 more)

### Community 69 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (8): claude(), clearFixture(), copilot(), disk, event(), fixtures, releases, sdkSession()

### Community 70 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 71 - "session-resource-providers.test.ts"
Cohesion: 0.18
Nodes (14): cleanupFixtures(), claudeFixture(), ClaudeMcpRead, copilotFixture(), deferred(), directory(), DiscoveredMcp, DiscoveredSkills (+6 more)

### Community 72 - "directory-browser.ts"
Cohesion: 0.28
Nodes (11): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin(), SessionDirectoryError (+3 more)

### Community 73 - "api.test.ts"
Cohesion: 0.21
Nodes (14): HUB_SNAPSHOT_TIMEOUT_MS, sendMessage(), failWith(), sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), currentSessionEventSequence(), nextSessionEventSequence() (+6 more)

### Community 74 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 75 - "NewSessionDialog"
Cohesion: 0.20
Nodes (16): provider(), activateSession(), createSession(), listDirectories(), listHistory(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse() (+8 more)

### Community 76 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 77 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 78 - "background-task-stop.test.ts"
Cohesion: 0.23
Nodes (12): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), started() (+4 more)

### Community 80 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 81 - "registerSessionKnowledgeRoutes"
Cohesion: 0.30
Nodes (11): registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession(), recordReplacement() (+3 more)

### Community 82 - "BackgroundTasksDialog.tsx"
Cohesion: 0.23
Nodes (10): DialogFrame(), BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive() (+2 more)

### Community 83 - "capture-workbench-review.ts"
Cohesion: 0.17
Nodes (10): frame(), geometry, output, scratch, screenshot(), { values }, fixtureSessions, IDLE_SESSION_ID (+2 more)

### Community 84 - "workspace-fixtures.ts"
Cohesion: 0.17
Nodes (12): documents, FIXTURE_NOW, fixtureBackgroundTasks, fixtureEndpoints, fixtureKnowledgeListings, fixtureKnowledgePositions, fixtureModels, runtime (+4 more)

### Community 85 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 86 - "background-task-tracker.ts"
Cohesion: 0.27
Nodes (7): snapshot(), backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 87 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 88 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+4 more)

### Community 89 - "conversation-recovery.test.ts"
Cohesion: 0.15
Nodes (4): removeCopilotSessionFiles(), fixtures, recoverAndSeed(), releases

### Community 90 - "claude-agent-service.test.ts"
Cohesion: 0.18
Nodes (5): directories, fixture(), queryHandle(), services, waitForIdle()

### Community 91 - "promotion-monitor.test.ts"
Cohesion: 0.30
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 92 - "push-notification-service.ts"
Cohesion: 0.17
Nodes (9): PushSender, PushState, directories, RFC-8030, RFC-8030, sessionMuteSchema, subscriptionSchema, testNotificationSchema (+1 more)

### Community 93 - "queued-provider-dispatch.test.ts"
Cohesion: 0.18
Nodes (6): copilotSession(), fixtures, gate(), originalQueue, pause(), releases

### Community 94 - "recovery-seed-guards.test.ts"
Cohesion: 0.18
Nodes (8): bootLegacy(), directories, execute, pending, releases, SeedState, services, stores

### Community 95 - "session-resource-clear.test.ts"
Cohesion: 0.18
Nodes (11): apps, directories, directory(), obstructUploads(), pairedFixture(), providers, seed(), sockets (+3 more)

### Community 96 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 97 - "session-knowledge-routes.ts"
Cohesion: 0.18
Nodes (6): Lineage, RegistrationGeneration, ReplacementEvidence, SessionKnowledgeLifecycle, sessionParams, updateSchema

### Community 98 - "setupWorkspaceFixture"
Cohesion: 0.24
Nodes (6): pageFor(), createWorkspaceFixtureState(), fixtureBaseUrl(), fixtureValue(), setupWorkspaceFixture(), fixtureApi()

### Community 99 - ".oxlintrc.json"
Cohesion: 0.20
Nodes (9): ignorePatterns, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/**, graphify/.venv/** (+1 more)

### Community 100 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 101 - "session-resource-transport.ts"
Cohesion: 0.31
Nodes (8): CopilotResourceMethod, readClaudeMcp(), readCopilotResource(), copilotTransport(), disposals, Frame, write(), unavailable()

### Community 102 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 103 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 104 - "KnowledgePosition"
Cohesion: 0.33
Nodes (5): WorkspaceFixtureOptions, KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 105 - "remote-node-client.test.ts"
Cohesion: 0.28
Nodes (5): client(), servers, session, TERMINAL_REQUEST_TIMEOUT_MS, TERMINAL_STARTUP_TIMEOUT_MS

### Community 106 - "tmux-errors.test.ts"
Cohesion: 0.25
Nodes (6): directories, { execute }, files, links, listener(), server()

### Community 107 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, packageManager, private, type, version

### Community 110 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 111 - "render-workspace-gifs.ts"
Cohesion: 0.29
Nodes (6): directory, { values }, workflows, pnpm, onlyBuiltDependencies, ffmpeg-static

### Community 112 - "recovery-context.ts"
Cohesion: 0.38
Nodes (4): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief

### Community 113 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 114 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 115 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 116 - "removeComputer"
Cohesion: 0.60
Nodes (5): addComputer(), removeComputer(), ComputersDialog(), remove(), submit()

### Community 120 - "MermaidDiagram.tsx"
Cohesion: 0.67
Nodes (3): drawDiagram(), drawing, MermaidDiagram()

## Knowledge Gaps
- **682 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+677 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1030 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **22 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `server/side-question.ts`, `contracts.ts`, `claude-agent-service.ts`, `.get`, `agent-service.ts`, `SessionFileUpload`, `.publishError`, `.replyUserInputInternal`, `ProviderSessionService`, `.discoverTerminalSessions`, `conversation-recovery.test.ts`, `queued-dispatch.test.ts`, `.isRetiredSession`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `buildApp()` connect `app.ts` to `SessionDetail`, `ComputerManager`, `AgentService`, `delegated-transcription-service.ts`, `SessionOrderStore`, `.get`, `PushNotificationService`, `KnowledgeStore`, `cli-canary.ts`, `session-knowledge-store.ts`, `ClaudeAgentService`, `ProviderSessionService`, `transcription-service.ts`, `TranscriptionError`, `session-knowledge-routes.test.ts`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionDetail` to `AgentService`, `claude-agent-service.ts`, `.get`, `SessionFileUpload`, `.publishError`, `.isRetiredSession`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _682 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.03110008271298594 - nodes in this community are weakly interconnected._
- **Should `SessionDetail` be split into smaller, more focused modules?**
  _Cohesion score 0.04245439469320066 - nodes in this community are weakly interconnected._
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
