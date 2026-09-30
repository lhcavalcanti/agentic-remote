# Agentic Remote - Graphify code map

Snapshot: `93155e304638a48feb0450cc7046ef5efe43777a6fb98f37522673ad4bcc9076`

Source checkout: `c9dbb8b54a0332e8c9c0c2d5824fd415ec2a4f78`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 230 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 230 files · ~469,053 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3502 nodes · 9878 edges · 143 communities (106 shown, 21 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 727 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- SessionDetail
- api.ts
- App
- App.tsx
- AgentService
- background-task-adapter.ts
- agent-service.ts
- session-resources.ts
- SessionStore
- agentic-remote-promotion-monitor
- markdown-navigation.ts
- .get
- terminal-session.ts
- queued-provider-dispatch.test.ts
- contracts.ts
- session-presentation.ts
- claude-agent-service.ts
- terminal-startup-queue.test.ts
- bundle
- ProviderSessionService
- ComputerManager
- RemoteNodeClient
- SessionService
- pwa.ts
- TmuxTerminalSessionController
- lib.rs
- config.rs
- hub-routes.ts
- devDependencies
- knowledge-tree.ts
- agentic-remote
- dependencies
- CopilotSessionLike
- FakeSessionService
- SessionKnowledgeStore
- agentic-remote-promotion-setup
- tmux-errors.integration.test.ts
- node-routes.ts
- session-store-providers.test.ts
- session-enqueue-clear.test.ts
- .replyUserInputInternal
- session-store.ts
- SessionOrderStore
- terminal-session.test.ts
- delegated-transcription-service.ts
- scripts
- shell.ts
- PushNotificationService
- KnowledgeStore
- directory-browser.ts
- CopilotClientLike
- ComputerSummary
- transcription-service.ts
- compilerOptions
- session-resource-clear.test.ts
- capture-workspace.ts
- session-knowledge-store.ts
- noTmuxServer
- NewSessionDialog
- session-clear-transcript.test.ts
- session-reply-durability.test.ts
- workspace-browser.ts
- compilerOptions
- compilerOptions
- check-workspace-review-regressions.ts
- compilerOptions
- event-log.ts
- normalizeKnowledgeRelativePath
- app.ts
- NodeIdentityStore
- use-session-knowledge-root.ts
- ReaderWorkspace
- queued-dispatch.test.ts
- recovery-resend-durability.test.ts
- session-resource-routes.test.ts
- desktop.json
- registerSessionKnowledgeRoutes
- capture-workbench-review.ts
- package.json
- workspace-fixtures.ts
- settings-local.json
- push-notification-service.ts
- TranscriptionError
- session-response-order.ts
- shell-notifications.ts
- scripts
- promotion-monitor.test.ts
- recovery-seed-guards.test.ts
- html-preview.ts
- submission-error.ts
- session-knowledge-routes.ts
- composerHoldsText
- setupWorkspaceFixture
- .oxlintrc.json
- generate-pwa-icons.ts
- session-knowledge-routes.test.ts
- bridge.rs
- screenshot-stability.test.ts
- KnowledgePosition
- claude-agent-service.test.ts
- remote-node-client.test.ts
- session-resource-transport.ts
- SessionFileUpload
- release-publication.test.ts
- settings.ts
- composer-layout.test.ts
- MarkdownCodeBlock.tsx
- session-navigation-view.test.ts
- hub-routes.test.ts
- promotion-setup-execution.test.ts
- terminal-send-uncertainty.test.ts
- MockMediaRecorder
- MermaidDiagram.tsx
- version-policy.test.ts
- MermaidDiagram.test.tsx
- tsconfig.json
- vite.config.ts
- fastify
- @github/copilot-sdk
- lucide-react
- pdfjs-dist
- react-dom
- ws
- zod
- sw.js
- recovery-question-styles.test.ts
- agentic-remote-shell

## God Nodes (most connected - your core abstractions)
1. `SessionDetail` - 276 edges
2. `App()` - 244 edges
3. `AgentService` - 218 edges
4. `SessionStore` - 150 edges
5. `ClaudeAgentService` - 118 edges
6. `ComputerManager` - 80 edges
7. `registerHubRoutes()` - 75 edges
8. `SessionService` - 70 edges
9. `RemoteNodeClient` - 65 edges
10. `TmuxTerminalSessionController` - 58 edges

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

## Communities (143 total, 21 thin omitted)

### Community 0 - "SessionDetail"
Cohesion: 0.04
Nodes (10): ClaudeAgentService, isMissingClaudeSessionError(), preparePrompt(), copilotRequest(), claudeFixture(), clearRecoverySeedFailure(), QueuedPromptReservation, QueuedPrompt (+2 more)

### Community 1 - "api.ts"
Cohesion: 0.03
Nodes (112): parseSubmissionReceipt(), submissionReceiptFromError(), addKnowledgeRoot(), bootstrapSessionOrder(), cancelBackgroundTask(), cancelSession(), clearConversation(), definiteDispatchRefusals (+104 more)

### Community 2 - "App"
Cohesion: 0.04
Nodes (122): saveSessionOrderLane(), activeComposerPastes(), App(), adoptConversationReplacement(), appendComposerForKey(), appKeyDown(), applyComputerSnapshot(), applySession() (+114 more)

### Community 3 - "App.tsx"
Cohesion: 0.03
Nodes (110): addComputer(), configureRuntime(), removeComputer(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation() (+102 more)

### Community 4 - "AgentService"
Cohesion: 0.05
Nodes (7): agentMode(), AgentService, isMissingSessionError(), removeCopilotSessionFiles(), fixture(), httpBoundary(), TranscriptObservation

### Community 5 - "background-task-adapter.ts"
Cohesion: 0.05
Nodes (82): addActivity(), attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), boundedText(), errorValue() (+74 more)

### Community 6 - "agent-service.ts"
Cohesion: 0.05
Nodes (69): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, AgentServiceEvents (+61 more)

### Community 7 - "session-resources.ts"
Cohesion: 0.08
Nodes (50): ActiveClaudeQuery, ClaudeResources, releases, session, snapshot, claudeMcp(), claudeSkillNames(), copilotMcp (+42 more)

### Community 8 - "SessionStore"
Cohesion: 0.07
Nodes (29): fixture(), connect(), createStore(), deferred(), disk, enqueue(), fixture(), fixtures (+21 more)

### Community 9 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (67): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+59 more)

### Community 10 - "markdown-navigation.ts"
Cohesion: 0.06
Nodes (54): UserInputField, UserInputFieldValue, followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), MarkdownImage(), missingDocumentFragment(), WorkspaceDialog() (+46 more)

### Community 11 - ".get"
Cohesion: 0.09
Nodes (4): isUncertainDelivery(), queueConflict(), TerminalSessionController, deliveryUncertaintyFromError()

### Community 12 - "terminal-session.ts"
Cohesion: 0.10
Nodes (48): activeBottomFrame(), boxedComposerFrame(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), COMPOSER_PLACEHOLDERS, composerFrameText(), containsCopiedInteractiveFrame() (+40 more)

### Community 13 - "queued-provider-dispatch.test.ts"
Cohesion: 0.07
Nodes (23): acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight(), QueuedDelivery, QueuedDispatches (+15 more)

### Community 14 - "contracts.ts"
Cohesion: 0.06
Nodes (39): managers, releases, remote, RemoteResync, RemoteSessionRead, RegistryState, StoredNodeIdentity, DEFINITE_DISPATCH_REFUSALS (+31 more)

### Community 15 - "session-presentation.ts"
Cohesion: 0.08
Nodes (42): plugins, oxc, react, typescript, KnowledgeRootSelector(), root, SessionFilter, sessionNavigationView (+34 more)

### Community 16 - "claude-agent-service.ts"
Cohesion: 0.07
Nodes (24): AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission, PendingClaudeReply (+16 more)

### Community 17 - "terminal-startup-queue.test.ts"
Cohesion: 0.09
Nodes (36): directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), TerminalFormContinuation, exec, formFixture() (+28 more)

### Community 18 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 20 - "ComputerManager"
Cohesion: 0.19
Nodes (7): ComputerManager, managedSession(), RemoteSessionListing, registerHubRoutes(), ManagedRemovedQueuedPrompt, ManagedSession, SessionListing

### Community 21 - "RemoteNodeClient"
Cohesion: 0.07
Nodes (7): RemoteNodeClient, BackgroundTaskSnapshot, RemovedQueuedPrompt, WorkspaceFile, WorkspaceListing, KnowledgeFolderState, WorkspaceFileIcon()

### Community 23 - "pwa.ts"
Cohesion: 0.09
Nodes (36): directories, AppVersion, parseAppVersion(), getProviderRuntimeOptions(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart() (+28 more)

### Community 24 - "TmuxTerminalSessionController"
Cohesion: 0.13
Nodes (10): copilotCommand(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand(), safeWindowName(), tmuxTargetForPid(), TmuxTerminalSessionController (+2 more)

### Community 25 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 26 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 27 - "hub-routes.ts"
Cohesion: 0.06
Nodes (37): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+29 more)

### Community 28 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 29 - "knowledge-tree.ts"
Cohesion: 0.10
Nodes (32): listKnowledgeEntries(), readKnowledgeFile(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor(), knowledgeTreeKeyDown() (+24 more)

### Community 30 - "agentic-remote"
Cohesion: 0.13
Nodes (31): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+23 more)

### Community 31 - "dependencies"
Cohesion: 0.06
Nodes (33): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, @fastify/multipart, @fastify/static, @fastify/websocket, ffmpeg-static (+25 more)

### Community 32 - "CopilotSessionLike"
Cohesion: 0.08
Nodes (13): CopilotSessionLike, terminalFormSteps(), configurableModel(), DeferredSession, directories, FakeCopilotClient, services, startupFifoFixture() (+5 more)

### Community 33 - "FakeSessionService"
Cohesion: 0.09
Nodes (4): FakeSessionService, routingFixture(), session(), temporaryDirectory()

### Community 34 - "SessionKnowledgeStore"
Cohesion: 0.13
Nodes (10): bindingKey(), SessionKnowledgeConflictError, SessionKnowledgeRecoveryError, SessionKnowledgeStore, disk, fixture(), fixtures, releases (+2 more)

### Community 35 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (30): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+22 more)

### Community 36 - "tmux-errors.integration.test.ts"
Cohesion: 0.13
Nodes (30): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+22 more)

### Community 37 - "node-routes.ts"
Cohesion: 0.08
Nodes (27): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile(), AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER (+19 more)

### Community 38 - "session-store-providers.test.ts"
Cohesion: 0.08
Nodes (12): RuntimeConfigurationError, claude(), clearFixture(), copilot(), disk, event(), fixture(), fixtures (+4 more)

### Community 39 - "session-enqueue-clear.test.ts"
Cohesion: 0.09
Nodes (23): ClaudeSdk, deferred(), disk, enqueue(), fixtures, holdAdmissionWrite(), releases, disk (+15 more)

### Community 40 - ".replyUserInputInternal"
Cohesion: 0.12
Nodes (6): isForegroundCompletionEvent(), isForegroundLifecycleEvent(), persistedFormAnswer(), statusFromEvents(), PendingUserInput, SessionStatus

### Community 41 - "session-store.ts"
Cohesion: 0.08
Nodes (22): TerminalDiscoveryError, BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, activityDuration(), activityResultPreview(), archivedMessage() (+14 more)

### Community 42 - "SessionOrderStore"
Cohesion: 0.15
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 43 - "terminal-session.test.ts"
Cohesion: 0.09
Nodes (25): hasClippedTerminalFormTabs(), parseTerminalFormActiveField(), parseTerminalUpdateNotice(), submitTerminalForm(), tabNames(), terminalBoxWrap(), terminalChecklistState(), terminalFormCommitKeys() (+17 more)

### Community 44 - "delegated-transcription-service.ts"
Cohesion: 0.11
Nodes (13): BuildAppOptions, collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation (+5 more)

### Community 45 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 46 - "shell.ts"
Cohesion: 0.15
Nodes (24): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), onShellDeepLink(), onShellNotificationReply(), openShellSettings() (+16 more)

### Community 47 - "PushNotificationService"
Cohesion: 0.19
Nodes (3): HubEventSource, PushNotificationService, registerPushRoutes()

### Community 48 - "KnowledgeStore"
Cohesion: 0.18
Nodes (7): WorkspaceFixtureState, KnowledgeRootReservation, KnowledgeState, KnowledgeStore, directories, fixture(), KnowledgeRoot

### Community 49 - "directory-browser.ts"
Cohesion: 0.17
Nodes (13): DirectoryScope, displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin() (+5 more)

### Community 50 - "CopilotClientLike"
Cohesion: 0.08
Nodes (12): CopilotClientLike, holdProbe(), fixtures, gate(), releases, fixtures, recoverAndSeed(), releases (+4 more)

### Community 51 - "ComputerSummary"
Cohesion: 0.14
Nodes (7): fixture(), session(), sessionAtLeastAsNew(), RegisteredComputer, FakeManager, createHub(), ComputerSummary

### Community 52 - "transcription-service.ts"
Cohesion: 0.10
Nodes (20): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+12 more)

### Community 53 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 54 - "session-resource-clear.test.ts"
Cohesion: 0.09
Nodes (21): apps, directories, directory(), obstructUploads(), pairedFixture(), providers, seed(), sockets (+13 more)

### Community 55 - "capture-workspace.ts"
Cohesion: 0.19
Nodes (21): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+13 more)

### Community 56 - "session-knowledge-store.ts"
Cohesion: 0.10
Nodes (20): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+12 more)

### Community 57 - "noTmuxServer"
Cohesion: 0.12
Nodes (14): noTmuxServer(), processGone(), procVisible(), socketIdentity(), directories, { execute }, files, links (+6 more)

### Community 58 - "NewSessionDialog"
Cohesion: 0.15
Nodes (22): activateSession(), createSession(), executeCommand(), listDirectories(), listHistory(), listWorkspace(), validateSessionDirectory(), AddKnowledgeRootDialog() (+14 more)

### Community 59 - "session-clear-transcript.test.ts"
Cohesion: 0.11
Nodes (9): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions, disk, fixtures, gate(), holdTurnWrite() (+1 more)

### Community 60 - "session-reply-durability.test.ts"
Cohesion: 0.17
Nodes (17): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRunFixture() (+9 more)

### Community 61 - "workspace-browser.ts"
Cohesion: 0.19
Nodes (17): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+9 more)

### Community 62 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 63 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 64 - "check-workspace-review-regressions.ts"
Cohesion: 0.13
Nodes (15): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+7 more)

### Community 65 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 66 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 67 - "normalizeKnowledgeRelativePath"
Cohesion: 0.22
Nodes (15): joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath(), slashPath(), scopedKnowledgeRoot(), KnowledgeRootChoice (+7 more)

### Community 68 - "app.ts"
Cohesion: 0.17
Nodes (12): prefixes, session, trusted, untrusted, buildApp(), errorStatusCode(), isAppleTouchIconProbe(), transcriptionComputerName() (+4 more)

### Community 69 - "NodeIdentityStore"
Cohesion: 0.18
Nodes (4): ComputerRegistry, directories, remoteSnapshotFixture(), NodeIdentityStore

### Community 70 - "use-session-knowledge-root.ts"
Cohesion: 0.19
Nodes (12): getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey(), knowledgePositionForBinding(), SessionIdentity (+4 more)

### Community 71 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 72 - "queued-dispatch.test.ts"
Cohesion: 0.14
Nodes (9): accept(), deferred(), disk, fixture(), fixtures, holdWrite(), prompt(), releases (+1 more)

### Community 73 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 74 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 75 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 76 - "registerSessionKnowledgeRoutes"
Cohesion: 0.30
Nodes (11): registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession(), recordReplacement() (+3 more)

### Community 77 - "capture-workbench-review.ts"
Cohesion: 0.17
Nodes (10): frame(), geometry, output, scratch, screenshot(), { values }, fixtureSessions, IDLE_SESSION_ID (+2 more)

### Community 78 - "package.json"
Cohesion: 0.15
Nodes (11): directory, { values }, workflows, name, packageManager, pnpm, onlyBuiltDependencies, private (+3 more)

### Community 79 - "workspace-fixtures.ts"
Cohesion: 0.17
Nodes (12): documents, FIXTURE_NOW, fixtureBackgroundTasks, fixtureEndpoints, fixtureKnowledgeListings, fixtureKnowledgePositions, fixtureModels, runtime (+4 more)

### Community 80 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 81 - "push-notification-service.ts"
Cohesion: 0.15
Nodes (10): brief(), PushSender, PushState, directories, RFC-8030, RFC-8030, sessionMuteSchema, subscriptionSchema (+2 more)

### Community 82 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 83 - "session-response-order.ts"
Cohesion: 0.27
Nodes (11): sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), currentSessionEventSequence(), nextSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences (+3 more)

### Community 84 - "shell-notifications.ts"
Cohesion: 0.26
Nodes (10): key(), label(), NotifiableSession, notificationState(), requestId(), SessionNotificationState, ShellNotificationContext, shellNotifications() (+2 more)

### Community 85 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+4 more)

### Community 86 - "promotion-monitor.test.ts"
Cohesion: 0.30
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 87 - "recovery-seed-guards.test.ts"
Cohesion: 0.18
Nodes (8): bootLegacy(), directories, execute, pending, releases, SeedState, services, stores

### Community 88 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 89 - "submission-error.ts"
Cohesion: 0.31
Nodes (6): RemoteNodeRedirectError, RemoteNodeRequestError, httpDeliveryUncertain(), legacyDefinitiveHttpRefusals, SubmissionError, SubmissionReceipt

### Community 90 - "session-knowledge-routes.ts"
Cohesion: 0.18
Nodes (6): Lineage, RegistrationGeneration, ReplacementEvidence, SessionKnowledgeLifecycle, sessionParams, updateSchema

### Community 91 - "composerHoldsText"
Cohesion: 0.33
Nodes (11): composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), occurrences(), paneEvidenceCount(), paneShowsText(), pasteCouldCollapse() (+3 more)

### Community 92 - "setupWorkspaceFixture"
Cohesion: 0.24
Nodes (6): pageFor(), createWorkspaceFixtureState(), fixtureBaseUrl(), fixtureValue(), setupWorkspaceFixture(), fixtureApi()

### Community 93 - ".oxlintrc.json"
Cohesion: 0.20
Nodes (9): ignorePatterns, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/**, graphify/.venv/** (+1 more)

### Community 94 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 95 - "session-knowledge-routes.test.ts"
Cohesion: 0.22
Nodes (8): ServerRole, SessionMetadataLookup, disk, fixtures, gate(), holdWrite(), releases, trusted

### Community 96 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 97 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 98 - "KnowledgePosition"
Cohesion: 0.33
Nodes (5): WorkspaceFixtureOptions, KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 99 - "claude-agent-service.test.ts"
Cohesion: 0.25
Nodes (6): cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle()

### Community 100 - "remote-node-client.test.ts"
Cohesion: 0.28
Nodes (5): client(), servers, session, TERMINAL_REQUEST_TIMEOUT_MS, TERMINAL_STARTUP_TIMEOUT_MS

### Community 101 - "session-resource-transport.ts"
Cohesion: 0.36
Nodes (7): readClaudeMcp(), readCopilotResource(), copilotTransport(), disposals, Frame, write(), unavailable()

### Community 103 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 104 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 105 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 107 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 108 - "session-navigation-view.test.ts"
Cohesion: 0.33
Nodes (5): computers, first, grouped, hidden, last

### Community 114 - "MermaidDiagram.tsx"
Cohesion: 0.67
Nodes (3): drawDiagram(), drawing, MermaidDiagram()

## Knowledge Gaps
- **663 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+658 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1003 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `SessionDetail`, `session-store-providers.test.ts`, `session-resources.ts`, `.replyUserInputInternal`, `session-store.ts`, `SessionStore`, `.get`, `agent-service.ts`, `queued-provider-dispatch.test.ts`, `SessionFileUpload`, `directory-browser.ts`, `ProviderSessionService`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `RemoteNodeClient` connect `RemoteNodeClient` to `SessionFileUpload`, `session-resources.ts`, `contracts.ts`, `claude-agent-service.ts`, `directory-browser.ts`, `ComputerSummary`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `ClaudeAgentService` connect `SessionDetail` to `SessionFileUpload`, `session-resources.ts`, `queued-provider-dispatch.test.ts`, `claude-agent-service.ts`, `directory-browser.ts`, `ProviderSessionService`, `SessionService`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _663 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `SessionDetail` be split into smaller, more focused modules?**
  _Cohesion score 0.04185837728649983 - nodes in this community are weakly interconnected._
- **Should `api.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.03267740011926058 - nodes in this community are weakly interconnected._
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
