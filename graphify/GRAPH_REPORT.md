# Agentic Remote - Graphify code map

Snapshot: `2bcc3acecca39fea6bcb90d626f017c02e42a55bb1c38c2dbb43f0ca008b78a7`

Source checkout: `7d7d4df0a794e58c156285ad2b89b65086a0ad72`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 218 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 218 files · ~444,061 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3377 nodes · 9502 edges · 147 communities (110 shown, 23 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 708 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App
- App.tsx
- api.ts
- claude-agent-service.ts
- SessionDetail
- ClaudeAgentService
- session-presentation.ts
- contracts.ts
- agentic-remote-promotion-monitor
- markdown-navigation.ts
- ComputerManager
- AgentService
- SessionService
- RemoteNodeClient
- terminal-session.ts
- TmuxTerminalSessionController
- ProviderSessionService
- bundle
- FakeSessionService
- pwa.ts
- background-task-adapter.ts
- lib.rs
- agent-service.ts
- shell.ts
- config.rs
- workspace-browser.ts
- devDependencies
- tmux-test-helpers.ts
- dependencies
- agentic-remote
- tmux-errors.integration.test.ts
- session-store.ts
- .create
- app.ts
- hub-routes.ts
- agentic-remote-promotion-setup
- .get
- session-admission-lifecycle.test.ts
- session-knowledge-routes.test.ts
- CopilotSessionLike
- session-reply-durability.test.ts
- terminal-startup-queue.test.ts
- scripts
- queueConflict
- PushNotificationService
- .handleSessionEvent
- TerminalSessionController
- compilerOptions
- CopilotClientLike
- session-resource-providers.test.ts
- transcription-service.ts
- .replyUserInputInternal
- terminal-session.test.ts
- capture-workspace.ts
- active-sessions.ts
- delegated-transcription-service.ts
- node-routes.ts
- session-store-providers.test.ts
- .readAfterWrites
- queued-provider-dispatch.test.ts
- NewSessionDialog
- SessionKnowledgeStore
- compilerOptions
- KnowledgeStore
- compilerOptions
- check-workspace-review-regressions.ts
- compilerOptions
- use-session-knowledge-root.ts
- recordValue
- directory-browser.ts
- ReaderWorkspace
- agent-service.test.ts
- background-task-stop.test.ts
- queued-dispatch.test.ts
- recovery-resend-durability.test.ts
- session-knowledge-store.ts
- session-resource-routes.test.ts
- capture
- .acknowledgeFailedPrompt
- session-resource-clear.test.ts
- workspace-fixtures.ts
- desktop.json
- TranscriptionError
- knowledgePathChain
- BackgroundTasksDialog.tsx
- capture-workbench-review.ts
- package.json
- settings-local.json
- .syncTranscripts
- push-notification-service.ts
- registerSessionKnowledgeRoutes
- session-response-order.ts
- background-task-tracker.ts
- promotion-monitor.test.ts
- SessionAdmissions
- html-preview.ts
- scripts
- session-knowledge-routes.ts
- .oxlintrc.json
- messagesFromHistory
- DeferredSession
- session-enqueue-clear.test.ts
- bridge.rs
- setupWorkspaceFixture
- screenshot-stability.test.ts
- KnowledgePosition
- .configureRuntime
- remote-node-client.test.ts
- session-knowledge-store.test.ts
- conversation-recovery.test.ts
- recovery-context.ts
- remote-node-errors.ts
- settings.ts
- composer-layout.test.ts
- release-publication.test.ts
- MarkdownCodeBlock.tsx
- SessionRuntimeInfo
- terminal-send-uncertainty.test.ts
- MockMediaRecorder
- version-policy.test.ts
- MermaidDiagram.test.tsx
- tsconfig.json
- vite.config.ts
- @fastify/multipart
- @github/copilot-sdk
- lucide-react
- pdfjs-dist
- react-markdown
- ws
- zod
- sw.js
- recovery-question-styles.test.ts
- agentic-remote-shell

## God Nodes (most connected - your core abstractions)
1. `SessionDetail` - 276 edges
2. `App()` - 229 edges
3. `AgentService` - 217 edges
4. `SessionStore` - 150 edges
5. `ClaudeAgentService` - 118 edges
6. `ComputerManager` - 79 edges
7. `SessionService` - 70 edges
8. `RemoteNodeClient` - 65 edges
9. `registerHubRoutes()` - 59 edges
10. `TmuxTerminalSessionController` - 56 edges

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

## Communities (147 total, 23 thin omitted)

### Community 0 - "App"
Cohesion: 0.04
Nodes (126): replyPermission(), activeComposerPastes(), App(), adoptConversationReplacement(), answerUserInput(), appendComposerForKey(), appKeyDown(), applyComputerSnapshot() (+118 more)

### Community 1 - "App.tsx"
Cohesion: 0.03
Nodes (100): ActivityStatus, accentIconUrl(), applyAccentIcon(), addComputer(), configureRuntime(), removeComputer(), AccentTheme, accentThemes (+92 more)

### Community 2 - "api.ts"
Cohesion: 0.04
Nodes (94): AddKnowledgeRootInput, PushSettings, legacyDefinitiveHttpRefusals, parseSubmissionReceipt(), submissionReceiptFromError(), addKnowledgeRoot(), cancelBackgroundTask(), cancelSession() (+86 more)

### Community 3 - "claude-agent-service.ts"
Cohesion: 0.06
Nodes (64): AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission (+56 more)

### Community 4 - "SessionDetail"
Cohesion: 0.07
Nodes (8): observe(), SessionStore, StoredSession, acceptedStartupRecovery(), ChatMessage, QueuedPrompt, SessionDetail, SessionStatus

### Community 5 - "ClaudeAgentService"
Cohesion: 0.06
Nodes (7): ClaudeAgentService, isMissingClaudeSessionError(), cleanupFixtures(), waitForIdle(), QueuedPromptReservation, TranscriptObservation, RuntimeModelOption

### Community 6 - "session-presentation.ts"
Cohesion: 0.04
Nodes (65): plugins, oxc, react, typescript, KnowledgeRootChoice, KnowledgeRootChoices(), KnowledgeRootSession, actions (+57 more)

### Community 7 - "contracts.ts"
Cohesion: 0.07
Nodes (48): managers, releases, remote, RegistryState, DirectoryScope, directories, StoredNodeIdentity, ProviderSessionServiceEvents (+40 more)

### Community 8 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (67): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+59 more)

### Community 9 - "markdown-navigation.ts"
Cohesion: 0.06
Nodes (54): UserInputField, UserInputFieldValue, followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), MarkdownImage(), missingDocumentFragment(), WorkspaceDialog() (+46 more)

### Community 10 - "ComputerManager"
Cohesion: 0.12
Nodes (12): ComputerManager, managedSession(), fixture(), session(), RemoteSessionListing, sessionAtLeastAsNew(), registerHubRoutes(), FakeManager (+4 more)

### Community 11 - "AgentService"
Cohesion: 0.08
Nodes (3): AgentService, fixture(), httpBoundary()

### Community 12 - "SessionService"
Cohesion: 0.07
Nodes (9): ActiveClaudeQuery, registerNodeRoutes(), releases, session, snapshot, readServiceResources(), ResourceReads, resourceRequestHandler() (+1 more)

### Community 13 - "RemoteNodeClient"
Cohesion: 0.06
Nodes (6): RemoteResync, RemoteSessionRead, RegisteredComputer, headerSafe(), RemoteNodeClient, NodeInfo

### Community 14 - "terminal-session.ts"
Cohesion: 0.11
Nodes (46): activeBottomFrame(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), COMPOSER_PLACEHOLDERS, containsCopiedInteractiveFrame(), desktopInstallPromptIdentity(), findTerminalWrappedText() (+38 more)

### Community 15 - "TmuxTerminalSessionController"
Cohesion: 0.11
Nodes (17): findActiveCopilotProcesses(), copilotCommand(), execFileAsync, hasComposerAfter(), parseTerminalFormPrompt(), parseTerminalUpdateNotice(), processAncestors(), processCommand() (+9 more)

### Community 17 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 18 - "FakeSessionService"
Cohesion: 0.06
Nodes (4): FakeSessionService, routingFixture(), session(), temporaryDirectory()

### Community 19 - "pwa.ts"
Cohesion: 0.10
Nodes (35): directories, AppVersion, parseAppVersion(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog() (+27 more)

### Community 20 - "background-task-adapter.ts"
Cohesion: 0.12
Nodes (39): attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), CopilotTaskInfo, CopilotTaskProgress, eventString() (+31 more)

### Community 21 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 22 - "agent-service.ts"
Cohesion: 0.06
Nodes (35): AcceptedSdkReply, ActivePrompt, AgentServiceEvents, ansiSequence, commandShortcut(), CreationRuntime, DeliveryBoundary, ElicitationContext (+27 more)

### Community 23 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 24 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 25 - "workspace-browser.ts"
Cohesion: 0.10
Nodes (29): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+21 more)

### Community 26 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 27 - "tmux-test-helpers.ts"
Cohesion: 0.12
Nodes (27): directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), exec, formFixture(), horizontalFormFixture() (+19 more)

### Community 28 - "dependencies"
Cohesion: 0.06
Nodes (33): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/static, @fastify/websocket, ffmpeg-static (+25 more)

### Community 29 - "agentic-remote"
Cohesion: 0.14
Nodes (30): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+22 more)

### Community 30 - "tmux-errors.integration.test.ts"
Cohesion: 0.09
Nodes (23): listTmuxSessions(), execFileAsync, headers, ignoreMissing(), removeFixture(), seedSession(), sessionLog(), stopOwnedServer() (+15 more)

### Community 31 - "session-store.ts"
Cohesion: 0.07
Nodes (22): channels, directories, activityDuration(), activityResultPreview(), archivedMessage(), clearRecoverySeedFailure(), cloneSession(), emptyRetirements (+14 more)

### Community 32 - ".create"
Cohesion: 0.11
Nodes (21): fixture(), connect(), createStore(), deferred(), disk, enqueue(), fixture(), fixtures (+13 more)

### Community 33 - "app.ts"
Cohesion: 0.11
Nodes (18): prefixes, session, trusted, untrusted, buildApp(), errorStatusCode(), transcriptionComputerName(), FileUploadError (+10 more)

### Community 34 - "hub-routes.ts"
Cohesion: 0.07
Nodes (28): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+20 more)

### Community 35 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (28): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+20 more)

### Community 37 - "session-admission-lifecycle.test.ts"
Cohesion: 0.08
Nodes (18): deferred(), disk, enqueue(), fixtures, holdAdmissionWrite(), releases, disk, fixtures (+10 more)

### Community 38 - "session-knowledge-routes.test.ts"
Cohesion: 0.10
Nodes (12): ServerRole, SessionMetadataLookup, ComputerRegistry, directories, remoteSnapshotFixture(), NodeIdentityStore, disk, fixtures (+4 more)

### Community 39 - "CopilotSessionLike"
Cohesion: 0.12
Nodes (10): CopilotSessionLike, CopilotTasksApi, acceptanceReceipt(), QueuedDelivery, queuedSdkPrompt(), disposals, fixture(), boots (+2 more)

### Community 40 - "session-reply-durability.test.ts"
Cohesion: 0.13
Nodes (17): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRequest() (+9 more)

### Community 41 - "terminal-startup-queue.test.ts"
Cohesion: 0.13
Nodes (23): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+15 more)

### Community 42 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 43 - "queueConflict"
Cohesion: 0.17
Nodes (8): errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight(), queueConflict(), QueuedDispatchTarget, terminalRefused()

### Community 44 - "PushNotificationService"
Cohesion: 0.19
Nodes (3): HubEventSource, PushNotificationService, registerPushRoutes()

### Community 45 - ".handleSessionEvent"
Cohesion: 0.15
Nodes (20): activityGroupIdFor(), activityKind(), ActivityToolStart, contextTextLength(), estimatedContextTokens(), eventContextLength(), isActivityGroupKind(), isRuntimeReasoningEffort() (+12 more)

### Community 47 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 48 - "CopilotClientLike"
Cohesion: 0.09
Nodes (13): CopilotClientLike, holdProbe(), fixtures, gate(), releases, bootLegacy(), directories, execute (+5 more)

### Community 49 - "session-resource-providers.test.ts"
Cohesion: 0.12
Nodes (18): ClaudeSdk, directories, fixture(), queryHandle(), services, claudeFixture(), ClaudeMcpRead, copilotFixture() (+10 more)

### Community 50 - "transcription-service.ts"
Cohesion: 0.11
Nodes (19): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+11 more)

### Community 51 - ".replyUserInputInternal"
Cohesion: 0.18
Nodes (6): persistedFormAnswer(), TerminalFormContinuation, validateUserInputForm(), TerminalFormReplyError, PendingUserInput, UserInputReplyInput

### Community 52 - "terminal-session.test.ts"
Cohesion: 0.13
Nodes (20): composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), occurrences(), paneEvidenceCount(), paneShowsText(), pasteCouldCollapse() (+12 more)

### Community 53 - "capture-workspace.ts"
Cohesion: 0.19
Nodes (21): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+13 more)

### Community 54 - "active-sessions.ts"
Cohesion: 0.21
Nodes (21): ActiveProcess, execFileAsync, findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates(), isCopilotProcess() (+13 more)

### Community 55 - "delegated-transcription-service.ts"
Cohesion: 0.13
Nodes (11): BuildAppOptions, collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation (+3 more)

### Community 56 - "node-routes.ts"
Cohesion: 0.09
Nodes (21): AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema (+13 more)

### Community 57 - "session-store-providers.test.ts"
Cohesion: 0.11
Nodes (10): claude(), clearFixture(), copilot(), disk, event(), fixtures, holdOtherWrite(), releases (+2 more)

### Community 59 - "queued-provider-dispatch.test.ts"
Cohesion: 0.12
Nodes (11): QueuedDispatches, claudeFixture(), copilotFixture(), copilotSession(), fixtures, gate(), originalQueue, pause() (+3 more)

### Community 60 - "NewSessionDialog"
Cohesion: 0.15
Nodes (21): provider(), activateSession(), createSession(), executeCommand(), listDirectories(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse() (+13 more)

### Community 61 - "SessionKnowledgeStore"
Cohesion: 0.22
Nodes (3): bindingKey(), SessionKnowledgeStore, SessionKnowledgeBinding

### Community 62 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 63 - "KnowledgeStore"
Cohesion: 0.17
Nodes (6): KnowledgeState, KnowledgeStore, directories, fixture(), createHub(), KnowledgeRoot

### Community 64 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 65 - "check-workspace-review-regressions.ts"
Cohesion: 0.13
Nodes (15): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+7 more)

### Community 66 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 68 - "use-session-knowledge-root.ts"
Cohesion: 0.19
Nodes (12): getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey(), knowledgePositionForBinding(), SessionIdentity (+4 more)

### Community 69 - "recordValue"
Cohesion: 0.20
Nodes (17): addActivity(), boundedText(), errorValue(), notificationKind(), parsedValue(), recordValue(), shellExitFromValue(), shellIdFromFooter() (+9 more)

### Community 70 - "directory-browser.ts"
Cohesion: 0.28
Nodes (11): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin(), SessionDirectoryError (+3 more)

### Community 71 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 72 - "agent-service.test.ts"
Cohesion: 0.15
Nodes (7): terminalFormSteps(), configurableModel(), directories, FakeCopilotClient, services, startupFifoFixture(), UserInputForm

### Community 73 - "background-task-stop.test.ts"
Cohesion: 0.21
Nodes (13): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), snapshot() (+5 more)

### Community 74 - "queued-dispatch.test.ts"
Cohesion: 0.14
Nodes (9): accept(), deferred(), disk, fixture(), fixtures, holdWrite(), prompt(), releases (+1 more)

### Community 75 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 76 - "session-knowledge-store.ts"
Cohesion: 0.13
Nodes (12): bindingSchema, Identity, recoverySchema, RootCatalog, rootSchema, SessionKnowledgeEvents, SessionKnowledgePersistenceError, SessionKnowledgeRecoveryError (+4 more)

### Community 77 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 78 - "capture"
Cohesion: 0.18
Nodes (15): releaseRecording(), shortcutKeys(), startRecording(), stopRecording(), binding(), bindingLabel(), capturableCode(), isModifierCode() (+7 more)

### Community 79 - ".acknowledgeFailedPrompt"
Cohesion: 0.28
Nodes (3): isUncertainDelivery(), deliveryUncertaintyFromError(), SubmissionError

### Community 80 - "session-resource-clear.test.ts"
Cohesion: 0.17
Nodes (13): apps, directories, directory(), obstructUploads(), pairedFixture(), providerFixture(), providers, seed() (+5 more)

### Community 81 - "workspace-fixtures.ts"
Cohesion: 0.15
Nodes (13): documents, FIXTURE_NOW, fixtureBackgroundTasks, fixtureEndpoints, fixtureKnowledgeListings, fixtureKnowledgePositions, fixtureModels, runtime (+5 more)

### Community 82 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 83 - "TranscriptionError"
Cohesion: 0.26
Nodes (4): LocalTranscriptionService, sha256(), fixture(), TranscriptionError

### Community 84 - "knowledgePathChain"
Cohesion: 0.23
Nodes (14): applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeTreeKeyDown(), loadKnowledgeChain(), loadKnowledgeFolder(), openKnowledgeFile() (+6 more)

### Community 85 - "BackgroundTasksDialog.tsx"
Cohesion: 0.23
Nodes (10): DialogFrame(), BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive() (+2 more)

### Community 86 - "capture-workbench-review.ts"
Cohesion: 0.17
Nodes (10): frame(), geometry, output, scratch, screenshot(), { values }, fixtureSessions, IDLE_SESSION_ID (+2 more)

### Community 87 - "package.json"
Cohesion: 0.15
Nodes (11): directory, { values }, workflows, name, packageManager, pnpm, onlyBuiltDependencies, private (+3 more)

### Community 88 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 89 - ".syncTranscripts"
Cohesion: 0.27
Nodes (7): eventAgentId(), isBackgroundTaskEvent(), isForegroundCompletionEvent(), isForegroundLifecycleEvent(), pendingUserInputFromEvents(), statusFromEvents(), workingDirectoryFromEvents()

### Community 90 - "push-notification-service.ts"
Cohesion: 0.15
Nodes (10): brief(), PushSender, PushState, directories, RFC-8030, RFC-8030, sessionMuteSchema, subscriptionSchema (+2 more)

### Community 91 - "registerSessionKnowledgeRoutes"
Cohesion: 0.33
Nodes (11): registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession(), recordReplacement() (+3 more)

### Community 92 - "session-response-order.ts"
Cohesion: 0.27
Nodes (11): sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), currentSessionEventSequence(), nextSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences (+3 more)

### Community 93 - "background-task-tracker.ts"
Cohesion: 0.30
Nodes (6): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 94 - "promotion-monitor.test.ts"
Cohesion: 0.30
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 95 - "SessionAdmissions"
Cohesion: 0.20
Nodes (4): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions

### Community 96 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 97 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, check, dev, dev:server, dev:web, lint, start (+3 more)

### Community 98 - "session-knowledge-routes.ts"
Cohesion: 0.18
Nodes (6): Lineage, RegistrationGeneration, ReplacementEvidence, SessionKnowledgeLifecycle, sessionParams, updateSchema

### Community 99 - ".oxlintrc.json"
Cohesion: 0.20
Nodes (9): ignorePatterns, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/**, graphify/.venv/** (+1 more)

### Community 100 - "messagesFromHistory"
Cohesion: 0.24
Nodes (10): activityDuration(), activityResult(), messagesFromHistory(), previewText(), readableMcpServerName(), readableToolName(), sameToolLabel(), stripAnsi() (+2 more)

### Community 102 - "session-enqueue-clear.test.ts"
Cohesion: 0.29
Nodes (9): disk, EnqueueCase, fixtures, gate(), holdEnqueue(), joinedEnqueue(), quiet(), releases (+1 more)

### Community 103 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 104 - "setupWorkspaceFixture"
Cohesion: 0.25
Nodes (6): pageFor(), createWorkspaceFixtureState(), fixtureBaseUrl(), fixtureValue(), setupWorkspaceFixture(), fixtureApi()

### Community 105 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 106 - "KnowledgePosition"
Cohesion: 0.33
Nodes (5): WorkspaceFixtureOptions, KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 108 - "remote-node-client.test.ts"
Cohesion: 0.28
Nodes (5): client(), servers, session, TERMINAL_REQUEST_TIMEOUT_MS, TERMINAL_STARTUP_TIMEOUT_MS

### Community 109 - "session-knowledge-store.test.ts"
Cohesion: 0.25
Nodes (6): SessionKnowledgeConflictError, disk, fixture(), fixtures, releases, root()

### Community 110 - "conversation-recovery.test.ts"
Cohesion: 0.29
Nodes (3): fixtures, recoverAndSeed(), releases

### Community 111 - "recovery-context.ts"
Cohesion: 0.38
Nodes (4): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief

### Community 112 - "remote-node-errors.ts"
Cohesion: 0.43
Nodes (4): RemoteNodeRedirectError, RemoteNodeRequestError, httpDeliveryUncertain(), SubmissionReceipt

### Community 113 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 114 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 115 - "release-publication.test.ts"
Cohesion: 0.40
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 116 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

## Knowledge Gaps
- **644 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+639 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 971 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **23 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `.publish`, `.get`, `claude-agent-service.ts`, `CopilotSessionLike`, `contracts.ts`, `queueConflict`, `.configureRuntime`, `.handleSessionEvent`, `TerminalSessionController`, `.acknowledgeFailedPrompt`, `.replyUserInputInternal`, `SessionRuntimeInfo`, `agent-service.ts`, `.syncTranscripts`, `.readAfterWrites`, `queued-provider-dispatch.test.ts`, `session-store.ts`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `connect()` connect `.create` to `SessionDetail`, `ClaudeAgentService`, `.get`, `AgentService`, `ProviderSessionService`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `fixture()` connect `AgentService` to `recovery-resend-durability.test.ts`, `.replyUserInputInternal`, `SessionDetail`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _644 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.03837953091684435 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.02689075630252101 - nodes in this community are weakly interconnected._
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
- `public/apple-touch-icon-precomposed.png`
- `public/apple-touch-icon.png`
- `public/fonts/MonaSans.woff2`
- `public/fonts/OFL.txt`
- `public/icon.svg`
- `public/icons/apple-touch-icon.png`
- `public/icons/icon-192.png`
- `public/icons/icon-512-maskable.png`
- `public/icons/icon-512.png`
- `public/manifest.webmanifest`
- `shell/README.md`
- `shell/index.html`
- `shell/src/settings.css`
- `src/index.css`
