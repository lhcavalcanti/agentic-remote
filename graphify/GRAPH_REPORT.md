# Agentic Remote - Graphify code map

Snapshot: `f5a47b854a08596dd8d1964c148b85e942fb72dd0e050af78ab83afb09cfad54`

Source checkout: `e050e64d1acfc4645bef717b75de3631bdfdbbbc`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 238 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 238 files · ~486,252 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3592 nodes · 10165 edges · 143 communities (105 shown, 22 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 740 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- SessionStore
- api.ts
- AgentService
- App
- App.tsx
- SessionDetail
- contracts.ts
- sessionKey
- claude-agent-service.ts
- agent-service.ts
- ComputerManager
- terminal-session.ts
- agentic-remote-promotion-monitor
- queued-dispatch.test.ts
- transcription-service.ts
- .get
- app.ts
- RemoteNodeClient
- TmuxTerminalSessionController
- SessionService
- markdown-navigation.ts
- ProviderSessionService
- bundle
- FakeSessionService
- pwa.ts
- workspace-fixtures.ts
- lib.rs
- workspace-browser.ts
- shell.ts
- config.rs
- hub-routes.ts
- terminal-startup-queue.test.ts
- devDependencies
- tmux-errors.integration.test.ts
- SessionKnowledgeStore
- agentic-remote
- dependencies
- agentic-remote-promotion-setup
- active-sessions.ts
- terminal-session.test.ts
- PromptCards.tsx
- session-store-providers.test.ts
- CopilotSessionLike
- SessionOrderStore
- background-task-adapter.ts
- CopilotClientLike
- KnowledgeStore
- scripts
- compilerOptions
- capture-workspace.ts
- session-resource-providers.test.ts
- noTmuxServer
- PushNotificationService
- session-clear-transcript.test.ts
- compilerOptions
- session-enqueue-clear.test.ts
- compilerOptions
- compilerOptions
- session-resource-routes.test.ts
- event-log.ts
- session-knowledge-store.ts
- session-reply-durability.test.ts
- SessionKnowledgeBinding
- normalizeKnowledgeRelativePath
- .replyUserInputInternal
- recordValue
- server/side-question.ts
- directory-browser.ts
- readKnowledgeFile
- ReaderWorkspace
- HubEvent
- backgroundTasksFromEvents
- background-task-stop.test.ts
- NewSessionDialog
- recovery-resend-durability.test.ts
- .sendInternal
- capture
- check-workspace-review-regressions.ts
- desktop.json
- registerSessionKnowledgeRoutes
- BackgroundTasksDialog.tsx
- settings-local.json
- submission-error.ts
- session-resource-clear.test.ts
- scripts
- background-task-tracker.ts
- promotion-monitor.test.ts
- recovery-seed-guards.test.ts
- html-preview.ts
- session-knowledge-routes.ts
- .oxlintrc.json
- node:fs/promises
- generate-pwa-icons.ts
- bridge.rs
- screenshot-stability.test.ts
- claude-agent-service.test.ts
- remote-node-client.test.ts
- package.json
- release-publication.test.ts
- render-workspace-gifs.ts
- recovery-context.ts
- settings.ts
- composer-layout.test.ts
- knowledge-restore.ts
- MarkdownCodeBlock.tsx
- push-routes.ts
- hasRunningBackgroundAgent
- removeComputer
- promotion-setup-execution.test.ts
- terminal-send-uncertainty.test.ts
- MockMediaRecorder
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
- TerminalDiscoveryError
- recovery-question-styles.test.ts
- agentic-remote-shell

## God Nodes (most connected - your core abstractions)
1. `SessionDetail` - 276 edges
2. `App()` - 255 edges
3. `AgentService` - 225 edges
4. `SessionStore` - 153 edges
5. `ClaudeAgentService` - 118 edges
6. `ComputerManager` - 81 edges
7. `registerHubRoutes()` - 76 edges
8. `SessionService` - 71 edges
9. `RemoteNodeClient` - 66 edges
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

## Communities (143 total, 22 thin omitted)

### Community 0 - "SessionStore"
Cohesion: 0.04
Nodes (49): fixture(), fixture(), connect(), createStore(), deferred(), disk, enqueue(), fixture() (+41 more)

### Community 1 - "api.ts"
Cohesion: 0.03
Nodes (116): AddKnowledgeRootInput, PushSettings, addKnowledgeRoot(), bootstrapSessionOrder(), cancelBackgroundTask(), cancelSession(), clearConversation(), configureRuntime() (+108 more)

### Community 2 - "AgentService"
Cohesion: 0.05
Nodes (7): AgentService, isUncertainDelivery(), queueConflict(), fixture(), httpBoundary(), TerminalSessionController, deliveryUncertaintyFromError()

### Community 3 - "App"
Cohesion: 0.04
Nodes (120): askSession(), recoverConversation(), restartSession(), activeComposerPastes(), App(), adoptConversationReplacement(), appendComposerForKey(), appKeyDown() (+112 more)

### Community 4 - "App.tsx"
Cohesion: 0.03
Nodes (96): ActivityStatus, AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph() (+88 more)

### Community 5 - "SessionDetail"
Cohesion: 0.05
Nodes (12): ClaudeAgentService, isMissingClaudeSessionError(), answer(), claudeRequest(), copilotRequest(), claudeFixture(), copilotFixture(), directory() (+4 more)

### Community 6 - "contracts.ts"
Cohesion: 0.04
Nodes (54): ClaudeAgentServiceEvents, RemoteSessionListing, SessionMetadataLookup, DirectoryScope, directories, StoredNodeIdentity, AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER (+46 more)

### Community 7 - "sessionKey"
Cohesion: 0.05
Nodes (70): plugins, oxc, react, typescript, SessionExecutionMode, saveSessionOrderLane(), failureStampFor(), handleDragEnd() (+62 more)

### Community 8 - "claude-agent-service.ts"
Cohesion: 0.08
Nodes (53): AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission, PendingClaudeReply (+45 more)

### Community 9 - "agent-service.ts"
Cohesion: 0.06
Nodes (65): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, AgentServiceEvents (+57 more)

### Community 10 - "ComputerManager"
Cohesion: 0.10
Nodes (11): ComputerManager, managedSession(), sessionAtLeastAsNew(), registerHubRoutes(), SessionMuteCarrier, normalizeNodeUrl(), AddComputerInput, ComputerSummary (+3 more)

### Community 11 - "terminal-session.ts"
Cohesion: 0.07
Nodes (63): TerminalFormContinuation, activeBottomFrame(), boxedComposerFrame(), cleanDialogLine(), clearAutomaticStartupPrompts(), COMPOSER_PLACEHOLDERS, composerFrameText(), containsCopiedInteractiveFrame() (+55 more)

### Community 12 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (67): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+59 more)

### Community 13 - "queued-dispatch.test.ts"
Cohesion: 0.05
Nodes (32): acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight(), preparePrompt(), QueuedDelivery (+24 more)

### Community 14 - "transcription-service.ts"
Cohesion: 0.06
Nodes (35): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, transcriptionComputerName() (+27 more)

### Community 15 - ".get"
Cohesion: 0.09
Nodes (6): agentMode(), isForegroundCompletionEvent(), isForegroundLifecycleEvent(), isMissingSessionError(), removeCopilotSessionFiles(), statusFromEvents()

### Community 16 - "app.ts"
Cohesion: 0.05
Nodes (41): prefixes, session, trusted, untrusted, buildApp(), BuildAppOptions, errorStatusCode(), isAppleTouchIconProbe() (+33 more)

### Community 17 - "RemoteNodeClient"
Cohesion: 0.06
Nodes (10): RemoteResync, RemoteSessionRead, RegisteredComputer, headerSafe(), RemoteNodeClient, BackgroundTaskSnapshot, NodeInfo, RemovedQueuedPrompt (+2 more)

### Community 18 - "TmuxTerminalSessionController"
Cohesion: 0.10
Nodes (14): copilotCommand(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand(), processIsAlive(), safeWindowName(), submitTerminalForm() (+6 more)

### Community 19 - "SessionService"
Cohesion: 0.07
Nodes (8): ActiveClaudeQuery, registerNodeRoutes(), releases, session, snapshot, ResourceReads, resourceRequestHandler(), SessionService

### Community 20 - "markdown-navigation.ts"
Cohesion: 0.08
Nodes (40): executeCommand(), listWorkspace(), readWorkspaceFile(), moveSessionToBrowsedFolder(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink() (+32 more)

### Community 22 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 23 - "FakeSessionService"
Cohesion: 0.07
Nodes (7): FakeSessionService, routingFixture(), session(), temporaryDirectory(), AgentMode, AgentProvider, RuntimeReasoningEffort

### Community 24 - "pwa.ts"
Cohesion: 0.09
Nodes (36): directories, AppVersion, parseAppVersion(), getProviderRuntimeOptions(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart() (+28 more)

### Community 25 - "workspace-fixtures.ts"
Cohesion: 0.08
Nodes (31): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, createWorkspaceFixtureState() (+23 more)

### Community 26 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 27 - "workspace-browser.ts"
Cohesion: 0.09
Nodes (33): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+25 more)

### Community 28 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 29 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 30 - "hub-routes.ts"
Cohesion: 0.06
Nodes (37): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+29 more)

### Community 31 - "terminal-startup-queue.test.ts"
Cohesion: 0.12
Nodes (30): exec, formFixture(), horizontalFormFixture(), textFieldFormFixture(), directories, exec, deliveryFixture(), acceptedStartupRecovery() (+22 more)

### Community 32 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 33 - "tmux-errors.integration.test.ts"
Cohesion: 0.09
Nodes (17): fixture(), managers, releases, remote, session(), ComputerRegistry, RegistryState, directories (+9 more)

### Community 34 - "SessionKnowledgeStore"
Cohesion: 0.11
Nodes (12): bindingKey(), SessionKnowledgeConflictError, SessionKnowledgeRecoveryError, SessionKnowledgeStore, stateSchema, stateWithPaths(), disk, fixture() (+4 more)

### Community 35 - "agentic-remote"
Cohesion: 0.13
Nodes (31): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+23 more)

### Community 36 - "dependencies"
Cohesion: 0.06
Nodes (33): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, @fastify/multipart, @fastify/static, @fastify/websocket, lucide-react (+25 more)

### Community 37 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (30): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+22 more)

### Community 38 - "active-sessions.ts"
Cohesion: 0.14
Nodes (29): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+21 more)

### Community 39 - "terminal-session.test.ts"
Cohesion: 0.10
Nodes (27): composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), occurrences(), paneEvidenceCount(), paneShowsText(), parseTerminalUpdateNotice() (+19 more)

### Community 40 - "PromptCards.tsx"
Cohesion: 0.11
Nodes (24): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+16 more)

### Community 41 - "session-store-providers.test.ts"
Cohesion: 0.09
Nodes (11): RuntimeConfigurationError, claude(), clearFixture(), copilot(), disk, event(), fixture(), fixtures (+3 more)

### Community 42 - "CopilotSessionLike"
Cohesion: 0.08
Nodes (10): CopilotSessionLike, terminalFormSteps(), configurableModel(), DeferredSession, directories, FakeCopilotClient, services, startupFifoFixture() (+2 more)

### Community 43 - "SessionOrderStore"
Cohesion: 0.15
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 44 - "background-task-adapter.ts"
Cohesion: 0.13
Nodes (26): addActivity(), BackgroundTaskEventOptions, boundedText(), CopilotClientTaskInfo, CopilotClientTaskProgress, CopilotTaskInfo, CopilotTaskProgress, eventTask() (+18 more)

### Community 45 - "CopilotClientLike"
Cohesion: 0.07
Nodes (16): CopilotClientLike, holdProbe(), fixtures, gate(), releases, directories, fakeClient(), ForkRequest (+8 more)

### Community 46 - "KnowledgeStore"
Cohesion: 0.16
Nodes (8): WorkspaceFixtureState, KnowledgeRootReservation, KnowledgeState, KnowledgeStore, directories, fixture(), createHub(), KnowledgeRoot

### Community 47 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 48 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 49 - "capture-workspace.ts"
Cohesion: 0.19
Nodes (21): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+13 more)

### Community 50 - "session-resource-providers.test.ts"
Cohesion: 0.12
Nodes (18): ClaudeMcpRead, deferred(), DiscoveredMcp, DiscoveredSkills, fixtures, Mcp, pause(), releases (+10 more)

### Community 51 - "noTmuxServer"
Cohesion: 0.12
Nodes (14): noTmuxServer(), processGone(), procVisible(), socketIdentity(), directories, { execute }, files, links (+6 more)

### Community 53 - "session-clear-transcript.test.ts"
Cohesion: 0.11
Nodes (9): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions, disk, fixtures, gate(), holdTurnWrite() (+1 more)

### Community 54 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 55 - "session-enqueue-clear.test.ts"
Cohesion: 0.13
Nodes (16): ClaudeSdk, deferred(), disk, enqueue(), fixtures, holdAdmissionWrite(), releases, disk (+8 more)

### Community 56 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 57 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 58 - "session-resource-routes.test.ts"
Cohesion: 0.13
Nodes (9): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription (+1 more)

### Community 59 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 60 - "session-knowledge-store.ts"
Cohesion: 0.12
Nodes (17): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+9 more)

### Community 61 - "session-reply-durability.test.ts"
Cohesion: 0.18
Nodes (15): assistantFixture(), claudeFixture(), claudeQuestions(), claudeRunFixture(), copilotFixture(), copilotRunFixture(), disk, fallbackFormFixture() (+7 more)

### Community 62 - "SessionKnowledgeBinding"
Cohesion: 0.20
Nodes (13): SessionKnowledgeBinding, getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey(), knowledgePositionForBinding() (+5 more)

### Community 63 - "normalizeKnowledgeRelativePath"
Cohesion: 0.22
Nodes (15): joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath(), slashPath(), scopedKnowledgeRoot(), KnowledgeRootChoice (+7 more)

### Community 65 - "recordValue"
Cohesion: 0.18
Nodes (18): attachmentModeValue(), backgroundHandoff(), booleanValue(), errorValue(), notificationKind(), parsedValue(), rawTailText(), recordValue() (+10 more)

### Community 66 - "server/side-question.ts"
Cohesion: 0.22
Nodes (10): SIDE_QUESTION_CLEANUP_MS, SIDE_QUESTION_RUNTIME_IDLE_MS, SIDE_QUESTION_TIMEOUT_MS, sideQuestionBoundary(), SideQuestionError, sideQuestionPrompt(), withSideQuestionTimeout(), SIDE_QUESTION_EARLIER_ANSWER_MAX_LENGTH (+2 more)

### Community 67 - "directory-browser.ts"
Cohesion: 0.28
Nodes (11): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin(), SessionDirectoryError (+3 more)

### Community 68 - "readKnowledgeFile"
Cohesion: 0.17
Nodes (17): listKnowledgeEntries(), readKnowledgeFile(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor(), loadKnowledgeChain() (+9 more)

### Community 69 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 70 - "HubEvent"
Cohesion: 0.15
Nodes (10): WorkspaceFixture, ComputerManagerEvents, brief(), HubEventSource, PushSender, PushState, directories, RFC-8030 (+2 more)

### Community 71 - "backgroundTasksFromEvents"
Cohesion: 0.19
Nodes (16): backgroundTasksFromEvents(), eventString(), isLiveTaskStatus(), isOlderExecution(), isShellObserverTool(), isShellStopTool(), isShellTool(), isTerminalTaskStatus() (+8 more)

### Community 72 - "background-task-stop.test.ts"
Cohesion: 0.21
Nodes (13): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), snapshot() (+5 more)

### Community 73 - "NewSessionDialog"
Cohesion: 0.20
Nodes (16): provider(), activateSession(), createSession(), listDirectories(), listHistory(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse() (+8 more)

### Community 74 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 75 - ".sendInternal"
Cohesion: 0.35
Nodes (10): capturePane(), hasLiveTerminalComposer(), isTerminalAgentWorking(), isTerminalOverlay(), isTerminalSessionInUsePrompt(), parseTerminalFormPrompt(), parseTerminalUserInput(), TerminalDraftConflictError (+2 more)

### Community 76 - "capture"
Cohesion: 0.18
Nodes (15): releaseRecording(), shortcutKeys(), startRecording(), stopRecording(), binding(), bindingLabel(), capturableCode(), isModifierCode() (+7 more)

### Community 77 - "check-workspace-review-regressions.ts"
Cohesion: 0.15
Nodes (11): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+3 more)

### Community 78 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 79 - "registerSessionKnowledgeRoutes"
Cohesion: 0.30
Nodes (11): registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession(), recordReplacement() (+3 more)

### Community 80 - "BackgroundTasksDialog.tsx"
Cohesion: 0.23
Nodes (10): DialogFrame(), BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive() (+2 more)

### Community 81 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 82 - "submission-error.ts"
Cohesion: 0.26
Nodes (8): RemoteNodeRedirectError, RemoteNodeRequestError, httpDeliveryUncertain(), legacyDefinitiveHttpRefusals, parseSubmissionReceipt(), SubmissionError, SubmissionReceipt, submissionReceiptFromError()

### Community 83 - "session-resource-clear.test.ts"
Cohesion: 0.21
Nodes (12): apps, directories, directory(), obstructUploads(), pairedFixture(), providerFixture(), providers, seed() (+4 more)

### Community 84 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+4 more)

### Community 85 - "background-task-tracker.ts"
Cohesion: 0.30
Nodes (6): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 86 - "promotion-monitor.test.ts"
Cohesion: 0.30
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 87 - "recovery-seed-guards.test.ts"
Cohesion: 0.18
Nodes (8): bootLegacy(), directories, execute, pending, releases, SeedState, services, stores

### Community 88 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 89 - "session-knowledge-routes.ts"
Cohesion: 0.18
Nodes (6): Lineage, RegistrationGeneration, ReplacementEvidence, SessionKnowledgeLifecycle, sessionParams, updateSchema

### Community 90 - ".oxlintrc.json"
Cohesion: 0.20
Nodes (9): ignorePatterns, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/**, graphify/.venv/** (+1 more)

### Community 91 - "node:fs/promises"
Cohesion: 0.27
Nodes (7): disk, fixture(), fixtures, prompt(), ready(), releases, session()

### Community 92 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 93 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 94 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 95 - "claude-agent-service.test.ts"
Cohesion: 0.25
Nodes (6): cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle()

### Community 96 - "remote-node-client.test.ts"
Cohesion: 0.28
Nodes (5): client(), servers, session, TERMINAL_REQUEST_TIMEOUT_MS, TERMINAL_STARTUP_TIMEOUT_MS

### Community 97 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, packageManager, private, type, version

### Community 98 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 99 - "render-workspace-gifs.ts"
Cohesion: 0.29
Nodes (6): directory, { values }, workflows, pnpm, onlyBuiltDependencies, ffmpeg-static

### Community 100 - "recovery-context.ts"
Cohesion: 0.38
Nodes (4): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief

### Community 101 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 103 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 104 - "knowledge-restore.ts"
Cohesion: 0.47
Nodes (3): knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 105 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 106 - "push-routes.ts"
Cohesion: 0.40
Nodes (4): sessionMuteSchema, subscriptionSchema, testNotificationSchema, unsubscribeSchema

### Community 108 - "removeComputer"
Cohesion: 0.60
Nodes (5): addComputer(), removeComputer(), ComputersDialog(), remove(), submit()

### Community 113 - "MermaidDiagram.tsx"
Cohesion: 0.67
Nodes (3): drawDiagram(), drawing, MermaidDiagram()

## Knowledge Gaps
- **678 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+673 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1021 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **22 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `.replyUserInputInternal`, `SessionStore`, `server/side-question.ts`, `SessionDetail`, `.stopSettled`, `contracts.ts`, `claude-agent-service.ts`, `session-store-providers.test.ts`, `agent-service.ts`, `background-task-adapter.ts`, `queued-dispatch.test.ts`, `.get`, `session-resource-routes.test.ts`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **Why does `copilotFixture()` connect `session-reply-durability.test.ts` to `AgentService`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _678 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `SessionStore` be split into smaller, more focused modules?**
  _Cohesion score 0.03504698728579326 - nodes in this community are weakly interconnected._
- **Should `api.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.03273189914411288 - nodes in this community are weakly interconnected._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.04834605597964377 - nodes in this community are weakly interconnected._
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
