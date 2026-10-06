# Agentic Remote - Graphify code map

Snapshot: `e569e223b007c2cebcf7bb7d6eb2745319f2c77bfb5271f3842028bb02dc39d9`

Source checkout: `7c86eadabd16841e969d47f6523b82ddcb43912e`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 230 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 230 files · ~473,169 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3518 nodes · 9925 edges · 148 communities (109 shown, 24 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 730 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App
- App.tsx
- api.ts
- ClaudeAgentService
- AgentService
- SessionDetail
- contracts.ts
- queueConflict
- SessionStore
- agent-service.ts
- agentic-remote-promotion-monitor
- claude-agent-service.ts
- markdown-navigation.ts
- SessionService
- terminal-session.ts
- active-sessions.ts
- ComputerManager
- .get
- TmuxTerminalSessionController
- terminal-startup-queue.test.ts
- CopilotSessionLike
- BackgroundTaskSnapshot
- bundle
- RemoteNodeClient
- ProviderSessionService
- lib.rs
- shell.ts
- FakeSessionService
- config.rs
- hub-routes.ts
- pwa.ts
- devDependencies
- agentic-remote
- dependencies
- react
- SessionKnowledgeStore
- agentic-remote-promotion-setup
- session-store.ts
- node-routes.ts
- knowledge-tree.ts
- SessionOrderStore
- delegated-transcription-service.ts
- .sendInternal
- SessionResources.tsx
- scripts
- directory-browser.ts
- background-task-adapter.ts
- PushNotificationService
- KnowledgeStore
- transcription-service.ts
- compilerOptions
- app.ts
- capture-workspace.ts
- ResourceReads
- session-knowledge-store.ts
- ComputerSummary
- NewSessionDialog
- session-clear-transcript.test.ts
- session-reply-durability.test.ts
- claude-recovery-admission.test.ts
- compilerOptions
- session-store-providers.test.ts
- compilerOptions
- check-workspace-review-regressions.ts
- compilerOptions
- session-resource-routes.test.ts
- backgroundTasksFromEvents
- event-log.ts
- terminal-session.test.ts
- workspace-browser.ts
- normalizeKnowledgeRelativePath
- session-admission-lifecycle.test.ts
- NodeIdentityStore
- ReaderWorkspace
- queued-dispatch.test.ts
- recovery-resend-durability.test.ts
- capture
- recordValue
- background-task-stop.test.ts
- desktop.json
- session-knowledge-routes.test.ts
- registerSessionKnowledgeRoutes
- capture-workbench-review.ts
- workspace-fixtures.ts
- settings-local.json
- background-task-tracker.ts
- push-notification-service.ts
- TranscriptionError
- scripts
- promotion-monitor.test.ts
- recovery-seed-guards.test.ts
- submission-error.ts
- session-response-order.ts
- BackgroundTasksDialog.tsx
- html-preview.ts
- .configureRuntime
- session-knowledge-routes.ts
- setupWorkspaceFixture
- .oxlintrc.json
- generate-pwa-icons.ts
- DeferredSession
- session-enqueue-clear.test.ts
- bridge.rs
- screenshot-stability.test.ts
- KnowledgePosition
- remote-node-client.test.ts
- package.json
- SessionFileUpload
- release-publication.test.ts
- render-workspace-gifs.ts
- settings.ts
- composer-layout.test.ts
- session-navigation-view.test.ts
- hub-routes.test.ts
- promotion-setup-execution.test.ts
- terminal-send-uncertainty.test.ts
- MockMediaRecorder
- TerminalFormReplyError
- version-policy.test.ts
- MockWebSocket
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
2. `App()` - 245 edges
3. `AgentService` - 218 edges
4. `SessionStore` - 150 edges
5. `ClaudeAgentService` - 118 edges
6. `ComputerManager` - 80 edges
7. `registerHubRoutes()` - 75 edges
8. `SessionService` - 70 edges
9. `RemoteNodeClient` - 65 edges
10. `TmuxTerminalSessionController` - 59 edges

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

## Communities (148 total, 24 thin omitted)

### Community 0 - "App"
Cohesion: 0.03
Nodes (146): deleteKnowledgeRoot(), moveSessionToTmux(), readKnowledgeFile(), replyPermission(), replyUserInput(), restartSession(), saveSessionOrderLane(), saveSessionVisibility() (+138 more)

### Community 1 - "App.tsx"
Cohesion: 0.03
Nodes (97): hasActiveBackgroundTasks(), hasRunningBackgroundAgent(), addComputer(), configureRuntime(), removeComputer(), AccentTheme, accentThemes, activityKindFromMessage() (+89 more)

### Community 2 - "api.ts"
Cohesion: 0.04
Nodes (87): httpDeliveryUncertain(), addKnowledgeRoot(), bootstrapSessionOrder(), cancelBackgroundTask(), cancelSession(), clearConversation(), definiteDispatchRefusals, deleteSession() (+79 more)

### Community 3 - "ClaudeAgentService"
Cohesion: 0.05
Nodes (18): ClaudeAgentService, isMissingClaudeSessionError(), fixture(), claudeFixture(), ClaudeMcpRead, copilotFixture(), deferred(), directory() (+10 more)

### Community 4 - "AgentService"
Cohesion: 0.07
Nodes (4): AgentService, isUncertainDelivery(), httpBoundary(), deliveryUncertaintyFromError()

### Community 5 - "SessionDetail"
Cohesion: 0.06
Nodes (7): persistedFormAnswer(), fixture(), observe(), clearRecoverySeedFailure(), QueuedPrompt, SessionDetail, UserInputReplyInput

### Community 6 - "contracts.ts"
Cohesion: 0.05
Nodes (54): fixture(), managers, releases, remote, session(), RemoteResync, RemoteSessionRead, RegistryState (+46 more)

### Community 7 - "queueConflict"
Cohesion: 0.06
Nodes (18): acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight(), preparePrompt(), queueConflict() (+10 more)

### Community 8 - "SessionStore"
Cohesion: 0.06
Nodes (29): fixture(), connect(), recoveryFixture(), claudeFixture(), copilotFixture(), copilotSession(), fixtures, gate() (+21 more)

### Community 9 - "agent-service.ts"
Cohesion: 0.06
Nodes (67): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, AgentServiceEvents (+59 more)

### Community 10 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (67): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+59 more)

### Community 11 - "claude-agent-service.ts"
Cohesion: 0.09
Nodes (47): AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission (+39 more)

### Community 12 - "markdown-navigation.ts"
Cohesion: 0.07
Nodes (51): UserInputField, UserInputFieldValue, searchWorkspace(), followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), MarkdownImage(), missingDocumentFragment() (+43 more)

### Community 13 - "SessionService"
Cohesion: 0.07
Nodes (17): registerNodeRoutes(), apps, directories, directory(), obstructUploads(), pairedFixture(), providerFixture(), providers (+9 more)

### Community 14 - "terminal-session.ts"
Cohesion: 0.09
Nodes (52): activeBottomFrame(), boxedComposerFrame(), cleanDialogLine(), clearAutomaticStartupPrompts(), COMPOSER_PLACEHOLDERS, composerFrameText(), containsCopiedInteractiveFrame(), desktopInstallPromptIdentity() (+44 more)

### Community 15 - "active-sessions.ts"
Cohesion: 0.07
Nodes (43): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates(), isCopilotProcess() (+35 more)

### Community 16 - "ComputerManager"
Cohesion: 0.17
Nodes (6): ComputerManager, managedSession(), RemoteSessionListing, registerHubRoutes(), ManagedRemovedQueuedPrompt, ManagedSession

### Community 17 - ".get"
Cohesion: 0.11
Nodes (3): isMissingSessionError(), removeCopilotSessionFiles(), TranscriptObservation

### Community 18 - "TmuxTerminalSessionController"
Cohesion: 0.11
Nodes (14): copilotCommand(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand(), processIsAlive(), safeWindowName(), submitTerminalForm() (+6 more)

### Community 19 - "terminal-startup-queue.test.ts"
Cohesion: 0.09
Nodes (36): findActiveCopilotSessions(), directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), exec, formFixture() (+28 more)

### Community 20 - "CopilotSessionLike"
Cohesion: 0.05
Nodes (21): CopilotClientLike, CopilotSessionLike, holdProbe(), fixtures, gate(), releases, terminalFormSteps(), configurableModel() (+13 more)

### Community 21 - "BackgroundTaskSnapshot"
Cohesion: 0.10
Nodes (37): BackgroundTaskSnapshot, SessionFilter, sessionNavigationView, attentionRank, computerTone(), executionModeName(), matchesSessionSearch(), providerName() (+29 more)

### Community 22 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 23 - "RemoteNodeClient"
Cohesion: 0.07
Nodes (5): RemoteNodeClient, NodeInfo, RemovedQueuedPrompt, WorkspaceListing, KnowledgeFolderState

### Community 25 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 26 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 27 - "FakeSessionService"
Cohesion: 0.07
Nodes (4): FakeSessionService, routingFixture(), session(), temporaryDirectory()

### Community 28 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 29 - "hub-routes.ts"
Cohesion: 0.06
Nodes (37): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+29 more)

### Community 30 - "pwa.ts"
Cohesion: 0.11
Nodes (34): deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate(), testNotification() (+26 more)

### Community 31 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 32 - "agentic-remote"
Cohesion: 0.13
Nodes (31): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+23 more)

### Community 33 - "dependencies"
Cohesion: 0.06
Nodes (33): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, @fastify/multipart, @fastify/static, @fastify/websocket, lucide-react (+25 more)

### Community 34 - "react"
Cohesion: 0.07
Nodes (18): plugins, oxc, react, typescript, DialogFrame(), DocumentViewControls(), actions, outline (+10 more)

### Community 35 - "SessionKnowledgeStore"
Cohesion: 0.13
Nodes (10): bindingKey(), SessionKnowledgeConflictError, SessionKnowledgeRecoveryError, SessionKnowledgeStore, disk, fixture(), fixtures, releases (+2 more)

### Community 36 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (30): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+22 more)

### Community 37 - "session-store.ts"
Cohesion: 0.07
Nodes (24): PendingTerminalQueueSettlement, TerminalDiscoveryError, BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, activityDuration(), activityResultPreview() (+16 more)

### Community 38 - "node-routes.ts"
Cohesion: 0.08
Nodes (27): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile(), AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER (+19 more)

### Community 39 - "knowledge-tree.ts"
Cohesion: 0.11
Nodes (29): WorkspaceEntry, applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeTreeKeyDown(), loadKnowledgeChain(), loadKnowledgeFolder() (+21 more)

### Community 40 - "SessionOrderStore"
Cohesion: 0.15
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 41 - "delegated-transcription-service.ts"
Cohesion: 0.12
Nodes (14): BuildAppOptions, collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation (+6 more)

### Community 42 - ".sendInternal"
Cohesion: 0.17
Nodes (20): capturePane(), composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), hasComposerAfter(), hasLiveTerminalComposer(), isTerminalAgentWorking() (+12 more)

### Community 43 - "SessionResources.tsx"
Cohesion: 0.11
Nodes (24): ManagedSessionMcpServersSnapshot, ManagedSessionSkillsSnapshot, SessionMcpServerSummary, SessionResourceSource, SessionSkillSummary, isMcpSummary(), isRecord(), isSkillSummary() (+16 more)

### Community 44 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 45 - "directory-browser.ts"
Cohesion: 0.17
Nodes (13): DirectoryScope, displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin() (+5 more)

### Community 46 - "background-task-adapter.ts"
Cohesion: 0.14
Nodes (23): attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, booleanValue(), CopilotClientTaskInfo, CopilotClientTaskProgress, CopilotTaskInfo, CopilotTaskProgress (+15 more)

### Community 47 - "PushNotificationService"
Cohesion: 0.19
Nodes (3): HubEventSource, PushNotificationService, registerPushRoutes()

### Community 48 - "KnowledgeStore"
Cohesion: 0.18
Nodes (7): WorkspaceFixtureState, KnowledgeRootReservation, KnowledgeState, KnowledgeStore, directories, fixture(), KnowledgeRoot

### Community 49 - "transcription-service.ts"
Cohesion: 0.10
Nodes (20): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+12 more)

### Community 50 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 51 - "app.ts"
Cohesion: 0.14
Nodes (15): prefixes, session, trusted, untrusted, directories, buildApp(), errorStatusCode(), isAppleTouchIconProbe() (+7 more)

### Community 52 - "capture-workspace.ts"
Cohesion: 0.19
Nodes (21): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+13 more)

### Community 53 - "ResourceReads"
Cohesion: 0.13
Nodes (14): ActiveClaudeQuery, releases, session, snapshot, CopilotResourceMethod, readClaudeMcp(), readCopilotResource(), copilotTransport() (+6 more)

### Community 54 - "session-knowledge-store.ts"
Cohesion: 0.10
Nodes (20): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+12 more)

### Community 55 - "ComputerSummary"
Cohesion: 0.18
Nodes (4): sessionAtLeastAsNew(), RegisteredComputer, createHub(), ComputerSummary

### Community 56 - "NewSessionDialog"
Cohesion: 0.15
Nodes (21): provider(), activateSession(), createSession(), executeCommand(), listDirectories(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse() (+13 more)

### Community 57 - "session-clear-transcript.test.ts"
Cohesion: 0.11
Nodes (9): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions, disk, fixtures, gate(), holdTurnWrite() (+1 more)

### Community 58 - "session-reply-durability.test.ts"
Cohesion: 0.16
Nodes (17): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRequest() (+9 more)

### Community 59 - "claude-recovery-admission.test.ts"
Cohesion: 0.13
Nodes (15): createStore(), deferred(), disk, enqueue(), fixture(), fixtures, holdClaimWrite(), releases (+7 more)

### Community 60 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 61 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (9): claude(), clearFixture(), copilot(), disk, event(), fixtures, holdOtherWrite(), releases (+1 more)

### Community 62 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 63 - "check-workspace-review-regressions.ts"
Cohesion: 0.13
Nodes (15): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+7 more)

### Community 64 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 65 - "session-resource-routes.test.ts"
Cohesion: 0.13
Nodes (9): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription (+1 more)

### Community 66 - "backgroundTasksFromEvents"
Cohesion: 0.16
Nodes (19): backgroundTasksFromEvents(), eventString(), eventTask(), executionModeValue(), isLiveTaskStatus(), isOlderExecution(), isShellObserverTool(), isShellStopTool() (+11 more)

### Community 67 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 68 - "terminal-session.test.ts"
Cohesion: 0.12
Nodes (15): parseTerminalUpdateNotice(), bracketedTabPane, clearFixture(), desktopInstallPane, directories, downloadedUpdateFooter, execFileAsync, fixtureReceiptWriter() (+7 more)

### Community 69 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 70 - "normalizeKnowledgeRelativePath"
Cohesion: 0.22
Nodes (15): joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath(), slashPath(), scopedKnowledgeRoot(), KnowledgeRootChoice (+7 more)

### Community 71 - "session-admission-lifecycle.test.ts"
Cohesion: 0.12
Nodes (12): ClaudeSdk, cleanupFixtures(), directories, queryHandle(), services, waitForIdle(), deferred(), disk (+4 more)

### Community 72 - "NodeIdentityStore"
Cohesion: 0.18
Nodes (4): ComputerRegistry, directories, remoteSnapshotFixture(), NodeIdentityStore

### Community 73 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 74 - "queued-dispatch.test.ts"
Cohesion: 0.14
Nodes (9): accept(), deferred(), disk, fixture(), fixtures, holdWrite(), prompt(), releases (+1 more)

### Community 75 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 76 - "capture"
Cohesion: 0.18
Nodes (15): releaseRecording(), shortcutKeys(), startRecording(), stopRecording(), binding(), bindingLabel(), capturableCode(), isModifierCode() (+7 more)

### Community 77 - "recordValue"
Cohesion: 0.24
Nodes (15): addActivity(), boundedText(), errorValue(), parsedValue(), recordValue(), shellExitFromValue(), shellIdFromValue(), shellTask() (+7 more)

### Community 78 - "background-task-stop.test.ts"
Cohesion: 0.23
Nodes (12): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), started() (+4 more)

### Community 79 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 80 - "session-knowledge-routes.test.ts"
Cohesion: 0.15
Nodes (10): ServerRole, SessionMetadataLookup, StoredNodeIdentity, disk, FakeManager, fixtures, gate(), holdWrite() (+2 more)

### Community 81 - "registerSessionKnowledgeRoutes"
Cohesion: 0.30
Nodes (11): registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession(), recordReplacement() (+3 more)

### Community 82 - "capture-workbench-review.ts"
Cohesion: 0.17
Nodes (10): frame(), geometry, output, scratch, screenshot(), { values }, fixtureSessions, IDLE_SESSION_ID (+2 more)

### Community 83 - "workspace-fixtures.ts"
Cohesion: 0.17
Nodes (12): documents, FIXTURE_NOW, fixtureBackgroundTasks, fixtureEndpoints, fixtureKnowledgeListings, fixtureKnowledgePositions, fixtureModels, runtime (+4 more)

### Community 84 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 85 - "background-task-tracker.ts"
Cohesion: 0.27
Nodes (7): snapshot(), backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 86 - "push-notification-service.ts"
Cohesion: 0.15
Nodes (10): brief(), PushSender, PushState, directories, RFC-8030, RFC-8030, sessionMuteSchema, subscriptionSchema (+2 more)

### Community 87 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 88 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+4 more)

### Community 89 - "promotion-monitor.test.ts"
Cohesion: 0.30
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 90 - "recovery-seed-guards.test.ts"
Cohesion: 0.18
Nodes (8): bootLegacy(), directories, execute, pending, releases, SeedState, services, stores

### Community 91 - "submission-error.ts"
Cohesion: 0.26
Nodes (7): RemoteNodeRedirectError, RemoteNodeRequestError, legacyDefinitiveHttpRefusals, parseSubmissionReceipt(), SubmissionError, SubmissionReceipt, submissionReceiptFromError()

### Community 92 - "session-response-order.ts"
Cohesion: 0.29
Nodes (10): sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), nextSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences, sessionResponseStartedAt() (+2 more)

### Community 93 - "BackgroundTasksDialog.tsx"
Cohesion: 0.27
Nodes (9): BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive(), taskStatusLabel() (+1 more)

### Community 94 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 96 - "session-knowledge-routes.ts"
Cohesion: 0.18
Nodes (6): Lineage, RegistrationGeneration, ReplacementEvidence, SessionKnowledgeLifecycle, sessionParams, updateSchema

### Community 97 - "setupWorkspaceFixture"
Cohesion: 0.24
Nodes (6): pageFor(), createWorkspaceFixtureState(), fixtureBaseUrl(), fixtureValue(), setupWorkspaceFixture(), fixtureApi()

### Community 98 - ".oxlintrc.json"
Cohesion: 0.20
Nodes (9): ignorePatterns, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/**, graphify/.venv/** (+1 more)

### Community 99 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 101 - "session-enqueue-clear.test.ts"
Cohesion: 0.29
Nodes (9): disk, EnqueueCase, fixtures, gate(), holdEnqueue(), joinedEnqueue(), quiet(), releases (+1 more)

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

### Community 106 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, packageManager, private, type, version

### Community 108 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 109 - "render-workspace-gifs.ts"
Cohesion: 0.29
Nodes (6): directory, { values }, workflows, pnpm, onlyBuiltDependencies, ffmpeg-static

### Community 110 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 111 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 112 - "session-navigation-view.test.ts"
Cohesion: 0.33
Nodes (5): computers, first, grouped, hidden, last

## Knowledge Gaps
- **667 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+662 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1007 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **24 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `session-resource-routes.test.ts`, `session-store.ts`, `SessionDetail`, `queueConflict`, `agent-service.ts`, `claude-agent-service.ts`, `SessionFileUpload`, `directory-browser.ts`, `background-task-adapter.ts`, `.get`, `.configureRuntime`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionStore` to `ClaudeAgentService`, `AgentService`, `SessionDetail`, `queueConflict`, `SessionFileUpload`, `.get`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `RemoteNodeClient` connect `RemoteNodeClient` to `SessionDetail`, `contracts.ts`, `claude-agent-service.ts`, `SessionFileUpload`, `directory-browser.ts`, `ComputerSummary`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _667 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.032594856124267886 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.027409372236958444 - nodes in this community are weakly interconnected._
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
