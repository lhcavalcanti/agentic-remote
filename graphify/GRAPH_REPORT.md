# Agentic Remote - Graphify code map

Snapshot: `6657506b5565095889ed77262f964d9e87d53b4c53020e390f332f5a322ae0df`

Source checkout: `3d88848564571a97934dcf4cc6d6c7eca2f3ce20`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 238 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 238 files · ~484,720 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3584 nodes · 10124 edges · 166 communities (125 shown, 26 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 741 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- SessionStore
- App
- AgentService
- App.tsx
- api.ts
- SessionDetail
- contracts.ts
- agentic-remote-promotion-monitor
- claude-agent-service.ts
- queueConflict
- SessionService
- ComputerManager
- session-presentation.ts
- agent-service.ts
- terminal-session.ts
- RemoteNodeClient
- bundle
- ProviderSessionService
- terminal-startup-queue.test.ts
- lib.rs
- shell.ts
- pwa.ts
- config.rs
- hub-routes.ts
- FakeSessionService
- TmuxTerminalSessionController
- knowledge-tree.ts
- devDependencies
- agentic-remote
- dependencies
- .get
- .sendAdmittedWithBackend
- agentic-remote-promotion-setup
- active-sessions.ts
- .sendInternal
- SessionKnowledgeStore
- SessionOrderStore
- .syncTranscripts
- computer-manager-metadata.test.ts
- delegated-transcription-service.ts
- scripts
- BackgroundTasksDialog.tsx
- background-task-adapter.ts
- ComputerSummary
- SessionResources.tsx
- compilerOptions
- KnowledgeStore
- noTmuxServer
- terminal-session.test.ts
- transcription-service.ts
- backgroundTasksFromEvents
- node-routes.ts
- .replyUserInputInternal
- session-resource-providers.test.ts
- NewSessionDialog
- capture-workspace.ts
- app.ts
- PushNotificationService
- compilerOptions
- CopilotSessionLike
- HubEvent
- session-reply-durability.test.ts
- session-store-providers.test.ts
- markdown-navigation.ts
- compilerOptions
- compilerOptions
- event-log.ts
- workspace-browser.ts
- normalizeKnowledgeRelativePath
- session-knowledge-store.ts
- PromptCards.tsx
- directory-browser.ts
- use-session-knowledge-root.ts
- ReaderWorkspace
- workspace-fixtures.ts
- background-task-stop.test.ts
- queued-dispatch.test.ts
- recovery-resend-durability.test.ts
- session-resource-routes.test.ts
- .withFormViewport
- capture
- check-workspace-review-regressions.ts
- CopilotClientLike
- react
- desktop.json
- registerSessionKnowledgeRoutes
- capture-workbench-review.ts
- settings-local.json
- .claimFailure
- submission-error.ts
- session-resource-clear.test.ts
- server/side-question.ts
- TranscriptionError
- WorkspaceDialog
- session-response-order.ts
- scripts
- eventString
- promotion-monitor.test.ts
- recovery-seed-guards.test.ts
- SessionAdmissions
- html-preview.ts
- session-enqueue-clear.test.ts
- session-knowledge-routes.ts
- setupWorkspaceFixture
- .oxlintrc.json
- node:fs/promises
- generate-pwa-icons.ts
- DeferredSession
- session-knowledge-routes.test.ts
- session-admission-lifecycle.test.ts
- file-upload-routes.ts
- settings.ts
- bridge.rs
- screenshot-stability.test.ts
- remote-node-client.test.ts
- session-clear-transcript.test.ts
- session-knowledge-store.test.ts
- KnowledgePosition
- package.json
- release-publication.test.ts
- DocumentViewControls.tsx
- UserInputFieldControl
- render-workspace-gifs.ts
- recovery-context.ts
- toolActivityContent
- agent-service-side-question.test.ts
- composer-layout.test.ts
- session-navigation-view.test.ts
- hasRunningBackgroundAgent
- removeComputer
- .discoverTerminalSessions
- promotion-setup-execution.test.ts
- terminal-send-uncertainty.test.ts
- MockMediaRecorder
- MermaidDiagram.tsx
- SessionMuteCarrier
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
- StaleQueuedPromptReservationError
- agentic-remote-shell

## God Nodes (most connected - your core abstractions)
1. `SessionDetail` - 276 edges
2. `App()` - 251 edges
3. `AgentService` - 225 edges
4. `SessionStore` - 153 edges
5. `ClaudeAgentService` - 118 edges
6. `ComputerManager` - 81 edges
7. `registerHubRoutes()` - 76 edges
8. `SessionService` - 71 edges
9. `RemoteNodeClient` - 66 edges
10. `TmuxTerminalSessionController` - 59 edges

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

## Communities (166 total, 26 thin omitted)

### Community 0 - "SessionStore"
Cohesion: 0.03
Nodes (55): fixture(), holdProbe(), fixtures, gate(), releases, fixture(), cleanupFixtures(), directories (+47 more)

### Community 1 - "App"
Cohesion: 0.04
Nodes (127): deleteKnowledgeRoot(), deleteSession(), replyPermission(), saveSessionOrderLane(), saveSessionVisibility(), activeComposerPastes(), App(), adoptConversationReplacement() (+119 more)

### Community 2 - "AgentService"
Cohesion: 0.06
Nodes (3): AgentService, fixture(), httpBoundary()

### Community 3 - "App.tsx"
Cohesion: 0.03
Nodes (96): configureRuntime(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph() (+88 more)

### Community 4 - "api.ts"
Cohesion: 0.04
Nodes (93): parseSubmissionReceipt(), submissionReceiptFromError(), addKnowledgeRoot(), askSession(), bootstrapSessionOrder(), cancelBackgroundTask(), cancelSession(), clearConversation() (+85 more)

### Community 5 - "SessionDetail"
Cohesion: 0.05
Nodes (9): ClaudeAgentService, isMissingClaudeSessionError(), copilotRequest(), claudeFixture(), copilotFixture(), directory(), seed(), RuntimeModelOption (+1 more)

### Community 6 - "contracts.ts"
Cohesion: 0.04
Nodes (52): ClaudeAgentServiceEvents, RemoteResync, RemoteSessionRead, DirectoryScope, directories, AUDIO_TYPE_HEADER, ProviderSessionServiceEvents, provider() (+44 more)

### Community 7 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (67): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+59 more)

### Community 8 - "claude-agent-service.ts"
Cohesion: 0.09
Nodes (49): AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission, PendingClaudeReply (+41 more)

### Community 9 - "queueConflict"
Cohesion: 0.06
Nodes (28): acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight(), preparePrompt(), queueConflict() (+20 more)

### Community 10 - "SessionService"
Cohesion: 0.07
Nodes (11): ActiveClaudeQuery, registerNodeRoutes(), releases, session, snapshot, readServiceResources(), readSessionMcpServers(), readSessionSkills() (+3 more)

### Community 11 - "ComputerManager"
Cohesion: 0.15
Nodes (7): ComputerManager, managedSession(), RemoteSessionListing, registerHubRoutes(), ManagedRemovedQueuedPrompt, ManagedSession, SessionListing

### Community 12 - "session-presentation.ts"
Cohesion: 0.08
Nodes (43): SessionExecutionMode, KnowledgeRootSelector(), root, SessionFilter, sessionNavigationView, attentionRank, computerTone(), executionModeName() (+35 more)

### Community 13 - "agent-service.ts"
Cohesion: 0.05
Nodes (49): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), ActivityToolStart, AgentServiceEvents, ansiSequence, commandShortcut() (+41 more)

### Community 14 - "terminal-session.ts"
Cohesion: 0.07
Nodes (46): boxedComposerFrame(), COMPOSER_PLACEHOLDERS, composerFrameText(), composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), DOWNLOADED_UPDATE_LAYOUTS (+38 more)

### Community 15 - "RemoteNodeClient"
Cohesion: 0.06
Nodes (7): RemoteNodeClient, BackgroundTaskSnapshot, RemovedQueuedPrompt, WorkspaceFile, WorkspaceListing, KnowledgeFolderState, WorkspaceFileIcon()

### Community 16 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 18 - "terminal-startup-queue.test.ts"
Cohesion: 0.10
Nodes (34): directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), exec, formFixture(), horizontalFormFixture() (+26 more)

### Community 19 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 20 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 21 - "pwa.ts"
Cohesion: 0.10
Nodes (35): deletePushSubscription(), getProviderRuntimeOptions(), getPushPublicKey(), requestVoid(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog() (+27 more)

### Community 22 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 23 - "hub-routes.ts"
Cohesion: 0.06
Nodes (37): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+29 more)

### Community 24 - "FakeSessionService"
Cohesion: 0.08
Nodes (5): FakeSessionService, routingFixture(), session(), temporaryDirectory(), ConfigureRuntimeInput

### Community 25 - "TmuxTerminalSessionController"
Cohesion: 0.15
Nodes (7): copilotCommand(), execFileAsync, processAncestors(), processCommand(), tmuxTargetForPid(), TmuxTerminalSessionController, PendingPermission

### Community 26 - "knowledge-tree.ts"
Cohesion: 0.09
Nodes (34): WorkspaceEntry, listKnowledgeEntries(), readKnowledgeFile(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor() (+26 more)

### Community 27 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 28 - "agentic-remote"
Cohesion: 0.13
Nodes (31): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+23 more)

### Community 29 - "dependencies"
Cohesion: 0.06
Nodes (33): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, @fastify/multipart, @fastify/static, @fastify/websocket, lucide-react (+25 more)

### Community 30 - ".get"
Cohesion: 0.12
Nodes (5): agentMode(), isMissingSessionError(), removeCopilotSessionFiles(), RuntimeConfigurationError, SessionRuntimeInfo

### Community 32 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (30): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+22 more)

### Community 33 - "active-sessions.ts"
Cohesion: 0.14
Nodes (30): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+22 more)

### Community 34 - ".sendInternal"
Cohesion: 0.20
Nodes (26): activeBottomFrame(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), containsCopiedInteractiveFrame(), desktopInstallPromptIdentity(), findTerminalWrappedText(), hasLiveTerminalComposer() (+18 more)

### Community 35 - "SessionKnowledgeStore"
Cohesion: 0.14
Nodes (9): WorkspaceFixtureState, bindingKey(), RootCatalog, SessionKnowledgeEvents, SessionKnowledgeRecoveryError, SessionKnowledgeStore, stateSchema, SessionKnowledgeBinding (+1 more)

### Community 36 - "SessionOrderStore"
Cohesion: 0.15
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 37 - ".syncTranscripts"
Cohesion: 0.16
Nodes (16): activityKind(), activityResult(), eventAgentId(), isBackgroundTaskEvent(), isForegroundCompletionEvent(), isForegroundLifecycleEvent(), isRuntimeReasoningEffort(), isUnsupportedBackgroundTaskError() (+8 more)

### Community 38 - "computer-manager-metadata.test.ts"
Cohesion: 0.11
Nodes (11): BuildAppOptions, managers, releases, remote, ComputerRegistry, RegistryState, directories, remoteSnapshotFixture() (+3 more)

### Community 39 - "delegated-transcription-service.ts"
Cohesion: 0.11
Nodes (14): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, transcriptionComputerName() (+6 more)

### Community 40 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 41 - "BackgroundTasksDialog.tsx"
Cohesion: 0.13
Nodes (16): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask, DialogFrame(), BackgroundTaskCard() (+8 more)

### Community 42 - "background-task-adapter.ts"
Cohesion: 0.11
Nodes (23): BackgroundTaskEventOptions, CopilotClientTaskInfo, CopilotClientTaskProgress, CopilotTaskInfo, CopilotTaskProgress, isLiveTaskStatus(), isOlderExecution(), isShellObserverTool() (+15 more)

### Community 43 - "ComputerSummary"
Cohesion: 0.14
Nodes (7): fixture(), session(), sessionAtLeastAsNew(), RegisteredComputer, FakeManager, createHub(), ComputerSummary

### Community 44 - "SessionResources.tsx"
Cohesion: 0.10
Nodes (18): SessionMcpServerSummary, SessionResourceSource, SessionSkillSummary, SessionResourcesDialog(), SessionResourcesView, isSessionResourceCommandName(), sessionResourceCommand(), sessionResourceCommands (+10 more)

### Community 45 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 46 - "KnowledgeStore"
Cohesion: 0.19
Nodes (6): KnowledgeRootReservation, KnowledgeState, KnowledgeStore, directories, fixture(), KnowledgeRoot

### Community 47 - "noTmuxServer"
Cohesion: 0.12
Nodes (16): listTmuxSessions(), noTmuxServer(), processGone(), procVisible(), socketIdentity(), directories, { execute }, files (+8 more)

### Community 48 - "terminal-session.test.ts"
Cohesion: 0.11
Nodes (19): parseTerminalUpdateNotice(), terminalChecklistState(), terminalFormCommitKeys(), bracketedTabPane, clearFixture(), deliveryFixture(), desktopInstallPane, directories (+11 more)

### Community 49 - "transcription-service.ts"
Cohesion: 0.11
Nodes (19): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+11 more)

### Community 50 - "backgroundTasksFromEvents"
Cohesion: 0.21
Nodes (23): addActivity(), backgroundTasksFromEvents(), boundedText(), errorValue(), eventTask(), lastForegroundCompletionAt(), normalizeBackgroundTask(), notificationKind() (+15 more)

### Community 51 - "node-routes.ts"
Cohesion: 0.09
Nodes (22): AUDIO_FILENAME_HEADER, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, knowledgeFileQuerySchema (+14 more)

### Community 52 - ".replyUserInputInternal"
Cohesion: 0.17
Nodes (4): persistedFormAnswer(), TerminalFormReplyError, PendingUserInput, SessionStatus

### Community 53 - "session-resource-providers.test.ts"
Cohesion: 0.12
Nodes (18): ClaudeMcpRead, deferred(), DiscoveredMcp, DiscoveredSkills, fixtures, Mcp, pause(), releases (+10 more)

### Community 54 - "NewSessionDialog"
Cohesion: 0.15
Nodes (22): activateSession(), createSession(), executeCommand(), listDirectories(), listHistory(), listWorkspace(), validateSessionDirectory(), AddKnowledgeRootDialog() (+14 more)

### Community 55 - "capture-workspace.ts"
Cohesion: 0.20
Nodes (20): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+12 more)

### Community 56 - "app.ts"
Cohesion: 0.15
Nodes (13): prefixes, session, trusted, untrusted, directories, buildApp(), errorStatusCode(), isAppleTouchIconProbe() (+5 more)

### Community 58 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 59 - "CopilotSessionLike"
Cohesion: 0.13
Nodes (9): CopilotSessionLike, terminalFormSteps(), configurableModel(), directories, FakeCopilotClient, services, startupFifoFixture(), CopilotTasksApi (+1 more)

### Community 60 - "HubEvent"
Cohesion: 0.12
Nodes (13): ComputerManagerEvents, brief(), HubEventSource, PushSender, PushState, directories, RFC-8030, RFC-8030 (+5 more)

### Community 61 - "session-reply-durability.test.ts"
Cohesion: 0.17
Nodes (16): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRunFixture() (+8 more)

### Community 62 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (9): claude(), clearFixture(), copilot(), disk, event(), fixtures, releases, sdkSession() (+1 more)

### Community 63 - "markdown-navigation.ts"
Cohesion: 0.19
Nodes (18): MarkdownImage(), BreadcrumbSegment, breadcrumbSegments(), DocumentLink, headingSlug(), headingText(), inlineText(), isExternalSource() (+10 more)

### Community 64 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 65 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 66 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 67 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 68 - "normalizeKnowledgeRelativePath"
Cohesion: 0.22
Nodes (15): joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath(), slashPath(), scopedKnowledgeRoot(), KnowledgeRootChoice (+7 more)

### Community 69 - "session-knowledge-store.ts"
Cohesion: 0.12
Nodes (16): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+8 more)

### Community 70 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (13): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+5 more)

### Community 71 - "directory-browser.ts"
Cohesion: 0.28
Nodes (11): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin(), SessionDirectoryError (+3 more)

### Community 72 - "use-session-knowledge-root.ts"
Cohesion: 0.21
Nodes (12): getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey(), knowledgePositionForBinding(), SessionIdentity (+4 more)

### Community 73 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 74 - "workspace-fixtures.ts"
Cohesion: 0.16
Nodes (14): CONTEXT_EXAMPLE, documents, FIXTURE_NOW, fixtureBackgroundTasks, fixtureEndpoints, fixtureKnowledgeListings, fixtureKnowledgePositions, fixtureKnowledgeRoots (+6 more)

### Community 75 - "background-task-stop.test.ts"
Cohesion: 0.21
Nodes (13): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), snapshot() (+5 more)

### Community 76 - "queued-dispatch.test.ts"
Cohesion: 0.14
Nodes (9): accept(), deferred(), disk, fixture(), fixtures, holdWrite(), prompt(), releases (+1 more)

### Community 77 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 78 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 79 - ".withFormViewport"
Cohesion: 0.21
Nodes (11): formViewportTimeout(), hasClippedTerminalFormTabs(), parseTerminalFormActiveField(), submitTerminalForm(), tabNames(), terminalBoxWrap(), terminalFormQuestionEnd(), terminalFormShowsFields() (+3 more)

### Community 80 - "capture"
Cohesion: 0.18
Nodes (15): releaseRecording(), shortcutKeys(), startRecording(), stopRecording(), binding(), bindingLabel(), capturableCode(), isModifierCode() (+7 more)

### Community 81 - "check-workspace-review-regressions.ts"
Cohesion: 0.14
Nodes (12): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+4 more)

### Community 82 - "CopilotClientLike"
Cohesion: 0.13
Nodes (7): CopilotClientLike, fixtures, recoverAndSeed(), releases, boots, [directory, backend, resultPath, phase = 'idle'], fixtureRoot

### Community 83 - "react"
Cohesion: 0.16
Nodes (8): plugins, oxc, react, typescript, MarkdownCodeBlock(), copy(), originalClipboard, SessionActions()

### Community 84 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 85 - "registerSessionKnowledgeRoutes"
Cohesion: 0.30
Nodes (11): registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession(), recordReplacement() (+3 more)

### Community 86 - "capture-workbench-review.ts"
Cohesion: 0.17
Nodes (10): frame(), geometry, output, scratch, screenshot(), { values }, fixtureSessions, IDLE_SESSION_ID (+2 more)

### Community 87 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 89 - "submission-error.ts"
Cohesion: 0.24
Nodes (8): TerminalFormContinuation, RemoteNodeRedirectError, RemoteNodeRequestError, httpDeliveryUncertain(), legacyDefinitiveHttpRefusals, SubmissionError, SubmissionReceipt, terminalDraftConflictFromError()

### Community 90 - "session-resource-clear.test.ts"
Cohesion: 0.21
Nodes (12): apps, directories, directory(), obstructUploads(), pairedFixture(), providerFixture(), providers, seed() (+4 more)

### Community 91 - "server/side-question.ts"
Cohesion: 0.23
Nodes (8): SIDE_QUESTION_CLEANUP_MS, SIDE_QUESTION_RUNTIME_IDLE_MS, SIDE_QUESTION_TIMEOUT_MS, sideQuestionBoundary(), SideQuestionError, withSideQuestionTimeout(), SIDE_QUESTION_MAX_LENGTH, SideQuestionEntry

### Community 92 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 93 - "WorkspaceDialog"
Cohesion: 0.24
Nodes (11): followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), missingDocumentFragment(), WorkspaceDialog(), moveHere(), navigateDocument(), submitSearch() (+3 more)

### Community 94 - "session-response-order.ts"
Cohesion: 0.27
Nodes (11): sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), currentSessionEventSequence(), nextSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences (+3 more)

### Community 95 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+4 more)

### Community 96 - "eventString"
Cohesion: 0.23
Nodes (12): attachmentModeValue(), backgroundHandoff(), booleanValue(), eventString(), executionModeValue(), normalizedToolName(), shellIdFromFooter(), shellIdFromValue() (+4 more)

### Community 97 - "promotion-monitor.test.ts"
Cohesion: 0.30
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 98 - "recovery-seed-guards.test.ts"
Cohesion: 0.18
Nodes (8): bootLegacy(), directories, execute, pending, releases, SeedState, services, stores

### Community 99 - "SessionAdmissions"
Cohesion: 0.20
Nodes (4): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions

### Community 100 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 101 - "session-enqueue-clear.test.ts"
Cohesion: 0.29
Nodes (10): disk, EnqueueCase, fixture(), fixtures, gate(), holdEnqueue(), joinedEnqueue(), quiet() (+2 more)

### Community 102 - "session-knowledge-routes.ts"
Cohesion: 0.18
Nodes (6): Lineage, RegistrationGeneration, ReplacementEvidence, SessionKnowledgeLifecycle, sessionParams, updateSchema

### Community 103 - "setupWorkspaceFixture"
Cohesion: 0.24
Nodes (6): pageFor(), createWorkspaceFixtureState(), fixtureBaseUrl(), fixtureValue(), setupWorkspaceFixture(), fixtureApi()

### Community 104 - ".oxlintrc.json"
Cohesion: 0.20
Nodes (9): ignorePatterns, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/**, graphify/.venv/** (+1 more)

### Community 105 - "node:fs/promises"
Cohesion: 0.27
Nodes (7): disk, fixture(), fixtures, prompt(), ready(), releases, session()

### Community 106 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 108 - "session-knowledge-routes.test.ts"
Cohesion: 0.22
Nodes (8): ServerRole, SessionMetadataLookup, disk, fixtures, gate(), holdWrite(), releases, trusted

### Community 109 - "session-admission-lifecycle.test.ts"
Cohesion: 0.22
Nodes (7): ClaudeSdk, deferred(), disk, enqueue(), fixtures, holdAdmissionWrite(), releases

### Community 110 - "file-upload-routes.ts"
Cohesion: 0.29
Nodes (6): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile()

### Community 111 - "settings.ts"
Cohesion: 0.27
Nodes (8): HubConfig, load(), showError(), showUnreachableNotice(), trimmed(), SideQuestionDialog(), onKeyDown(), submit()

### Community 112 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 113 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 114 - "remote-node-client.test.ts"
Cohesion: 0.28
Nodes (5): client(), servers, session, TERMINAL_REQUEST_TIMEOUT_MS, TERMINAL_STARTUP_TIMEOUT_MS

### Community 115 - "session-clear-transcript.test.ts"
Cohesion: 0.25
Nodes (5): disk, fixtures, gate(), holdTurnWrite(), releases

### Community 116 - "session-knowledge-store.test.ts"
Cohesion: 0.25
Nodes (6): SessionKnowledgeConflictError, disk, fixture(), fixtures, releases, root()

### Community 117 - "KnowledgePosition"
Cohesion: 0.36
Nodes (4): WorkspaceFixtureOptions, KnowledgePosition, KnowledgeRestoreState, base

### Community 118 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, packageManager, private, type, version

### Community 119 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 120 - "DocumentViewControls.tsx"
Cohesion: 0.29
Nodes (4): DocumentViewControls(), actions, outline, DocumentHeading

### Community 121 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 122 - "render-workspace-gifs.ts"
Cohesion: 0.29
Nodes (6): directory, { values }, workflows, pnpm, onlyBuiltDependencies, ffmpeg-static

### Community 123 - "recovery-context.ts"
Cohesion: 0.38
Nodes (4): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief

### Community 124 - "toolActivityContent"
Cohesion: 0.40
Nodes (6): previewText(), readableMcpServerName(), readableToolName(), sameToolLabel(), stripAnsi(), toolActivityContent()

### Community 125 - "agent-service-side-question.test.ts"
Cohesion: 0.40
Nodes (5): directories, fakeClient(), ForkRequest, forkSession(), services

### Community 126 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 127 - "session-navigation-view.test.ts"
Cohesion: 0.33
Nodes (5): computers, first, grouped, hidden, last

### Community 129 - "removeComputer"
Cohesion: 0.60
Nodes (5): addComputer(), removeComputer(), ComputersDialog(), remove(), submit()

### Community 135 - "MermaidDiagram.tsx"
Cohesion: 0.67
Nodes (3): drawDiagram(), drawing, MermaidDiagram()

## Knowledge Gaps
- **678 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+673 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1021 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **26 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `SessionStore`, `.discoverTerminalSessions`, `.syncTranscripts`, `contracts.ts`, `claude-agent-service.ts`, `queueConflict`, `.replyUserInputInternal`, `.claimFailure`, `.get`, `.sendAdmittedWithBackend`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `copilotFixture()` connect `session-reply-durability.test.ts` to `SessionStore`, `AgentService`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _678 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `SessionStore` be split into smaller, more focused modules?**
  _Cohesion score 0.033056937534549476 - nodes in this community are weakly interconnected._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.038253178551686015 - nodes in this community are weakly interconnected._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.056117362199116935 - nodes in this community are weakly interconnected._
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
