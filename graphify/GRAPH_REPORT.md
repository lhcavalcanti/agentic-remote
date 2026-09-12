# Agentic Remote - Graphify code map

Snapshot: `1b88e94dd9705e5a17e51b4749617cb3f42f8d344f24f844dcd4cc0bcea461e0`

Source checkout: `88d169fac5c6c4e6d16633b1e0897889da6c4a67`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 223 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 223 files · ~451,213 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3429 nodes · 9678 edges · 131 communities (100 shown, 18 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 712 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App
- contracts.ts
- App.tsx
- api.ts
- SessionDetail
- background-task-adapter.ts
- claude-agent-service.ts
- AgentService
- SessionStore
- ComputerManager
- session-presentation.ts
- agentic-remote-promotion-monitor
- .readAfterWrites
- session-store.ts
- queued-dispatch.test.ts
- .get
- markdown-navigation.ts
- agent-service.ts
- SessionService
- terminal-startup-queue.test.ts
- terminal-session.ts
- TmuxTerminalSessionController
- bundle
- FakeSessionService
- ProviderSessionService
- pwa.ts
- lib.rs
- remote-node-client.ts
- shell.ts
- config.rs
- devDependencies
- session-resource-providers.test.ts
- terminal-session.test.ts
- dependencies
- agentic-remote
- hub-routes.ts
- app.ts
- .replyUserInputInternal
- agentic-remote-promotion-setup
- computer-manager-metadata.test.ts
- CopilotSessionLike
- session-knowledge-routes.test.ts
- .handleSessionEvent
- scripts
- directory-browser.ts
- SessionKnowledgeStore
- compilerOptions
- app-icon.ts
- active-sessions.ts
- transcription-service.ts
- NewSessionDialog
- PushNotificationService
- delegated-transcription-service.ts
- submission-error.ts
- session-knowledge-store.ts
- noTmuxServer
- capture-workspace.ts
- HubEvent
- session-clear-transcript.test.ts
- session-reply-durability.test.ts
- knowledge-tree.ts
- compilerOptions
- compilerOptions
- compilerOptions
- event-log.ts
- workspace-browser.ts
- normalizeKnowledgeRelativePath
- session-knowledge-store.test.ts
- use-session-knowledge-root.ts
- ReaderWorkspace
- workspace-fixtures.ts
- recovery-resend-durability.test.ts
- session-resource-routes.test.ts
- capture
- check-workspace-review-regressions.ts
- desktop.json
- registerSessionKnowledgeRoutes
- capture-workbench-review.ts
- package.json
- settings-local.json
- session-knowledge-routes.ts
- TranscriptionError
- session-response-order.ts
- scripts
- promotion-monitor.test.ts
- recovery-seed-guards.test.ts
- session-resource-clear.test.ts
- html-preview.ts
- .oxlintrc.json
- DeferredSession
- session-enqueue-clear.test.ts
- bridge.rs
- setupWorkspaceFixture
- screenshot-stability.test.ts
- KnowledgePosition
- DocumentViewControls.tsx
- .handleSessionMetadata
- recovery-context.ts
- settings.ts
- composer-layout.test.ts
- release-publication.test.ts
- MarkdownCodeBlock.tsx
- terminal-send-uncertainty.test.ts
- hasRunningBackgroundAgent
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
2. `App()` - 239 edges
3. `AgentService` - 217 edges
4. `SessionStore` - 150 edges
5. `ClaudeAgentService` - 118 edges
6. `ComputerManager` - 79 edges
7. `SessionService` - 70 edges
8. `RemoteNodeClient` - 65 edges
9. `registerHubRoutes()` - 62 edges
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

## Communities (131 total, 18 thin omitted)

### Community 0 - "App"
Cohesion: 0.04
Nodes (135): deleteSession(), listKnowledgeEntries(), readKnowledgeFile(), recoverConversation(), removeQueuedPrompt(), transcribeAudio(), uploadSessionFile(), activeComposerPastes() (+127 more)

### Community 1 - "contracts.ts"
Cohesion: 0.04
Nodes (46): RemoteResync, RemoteSessionListing, RemoteSessionRead, directories, ProviderSessionServiceEvents, normalizeNodeUrl(), RemoteNodeClient, ResourceRead (+38 more)

### Community 2 - "App.tsx"
Cohesion: 0.03
Nodes (96): ActivityStatus, AccentTheme, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph(), activityStatusLabel() (+88 more)

### Community 3 - "api.ts"
Cohesion: 0.04
Nodes (97): AddKnowledgeRootInput, PushSettings, addKnowledgeRoot(), cancelBackgroundTask(), cancelSession(), clearConversation(), configureRuntime(), definiteDispatchRefusals (+89 more)

### Community 4 - "SessionDetail"
Cohesion: 0.05
Nodes (6): ClaudeAgentService, isMissingClaudeSessionError(), clearRecoverySeedFailure(), QueuedPrompt, RuntimeModelOption, SessionDetail

### Community 5 - "background-task-adapter.ts"
Cohesion: 0.05
Nodes (84): addActivity(), attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), boundedText(), CopilotTaskInfo (+76 more)

### Community 6 - "claude-agent-service.ts"
Cohesion: 0.07
Nodes (57): AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission (+49 more)

### Community 7 - "AgentService"
Cohesion: 0.06
Nodes (4): AgentService, RuntimeConfigurationError, fixture(), httpBoundary()

### Community 8 - "SessionStore"
Cohesion: 0.07
Nodes (32): fixture(), connect(), createStore(), deferred(), disk, enqueue(), fixture(), fixtures (+24 more)

### Community 9 - "ComputerManager"
Cohesion: 0.10
Nodes (10): ComputerManager, managedSession(), sessionAtLeastAsNew(), RegisteredComputer, registerHubRoutes(), SessionMuteCarrier, FakeManager, ComputerSummary (+2 more)

### Community 10 - "session-presentation.ts"
Cohesion: 0.05
Nodes (55): plugins, oxc, react, typescript, KnowledgeRootSelector(), root, drawDiagram(), drawing (+47 more)

### Community 11 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (67): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+59 more)

### Community 12 - ".readAfterWrites"
Cohesion: 0.08
Nodes (4): isUncertainDelivery(), queueConflict(), TerminalSessionController, deliveryUncertaintyFromError()

### Community 13 - "session-store.ts"
Cohesion: 0.03
Nodes (41): CopilotClientLike, holdProbe(), fixtures, gate(), releases, fixtures, recoverAndSeed(), releases (+33 more)

### Community 14 - "queued-dispatch.test.ts"
Cohesion: 0.05
Nodes (26): errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight(), preparePrompt(), QueuedDelivery, QueuedDispatches (+18 more)

### Community 15 - ".get"
Cohesion: 0.08
Nodes (4): agentMode(), isMissingSessionError(), removeCopilotSessionFiles(), TranscriptObservation

### Community 16 - "markdown-navigation.ts"
Cohesion: 0.07
Nodes (49): PendingPermission, UserInputField, UserInputFieldValue, followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), MarkdownImage(), missingDocumentFragment() (+41 more)

### Community 17 - "agent-service.ts"
Cohesion: 0.04
Nodes (48): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), ActivityToolStart, AgentServiceEvents, ansiSequence, commandShortcut() (+40 more)

### Community 18 - "SessionService"
Cohesion: 0.07
Nodes (11): ActiveClaudeQuery, registerNodeRoutes(), releases, session, snapshot, readServiceResources(), readSessionMcpServers(), readSessionSkills() (+3 more)

### Community 19 - "terminal-startup-queue.test.ts"
Cohesion: 0.09
Nodes (37): directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), TerminalFormContinuation, exec, formFixture() (+29 more)

### Community 20 - "terminal-session.ts"
Cohesion: 0.12
Nodes (45): activeBottomFrame(), cleanDialogLine(), clearAutomaticStartupPrompts(), COMPOSER_PLACEHOLDERS, containsCopiedInteractiveFrame(), desktopInstallPromptIdentity(), findTerminalWrappedText(), FormViewport (+37 more)

### Community 21 - "TmuxTerminalSessionController"
Cohesion: 0.13
Nodes (9): capturePane(), copilotCommand(), execFileAsync, processAncestors(), processCommand(), processIsAlive(), submitTerminalForm(), tmuxTargetForPid() (+1 more)

### Community 22 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 23 - "FakeSessionService"
Cohesion: 0.06
Nodes (4): FakeSessionService, routingFixture(), session(), temporaryDirectory()

### Community 25 - "pwa.ts"
Cohesion: 0.10
Nodes (35): directories, AppVersion, parseAppVersion(), deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart() (+27 more)

### Community 26 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 27 - "remote-node-client.ts"
Cohesion: 0.06
Nodes (33): AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema (+25 more)

### Community 28 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 29 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 30 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 31 - "session-resource-providers.test.ts"
Cohesion: 0.08
Nodes (27): ClaudeSdk, cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle(), deferred() (+19 more)

### Community 32 - "terminal-session.test.ts"
Cohesion: 0.09
Nodes (29): composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), listTmuxSessions(), occurrences(), paneEvidenceCount(), paneShowsText() (+21 more)

### Community 33 - "dependencies"
Cohesion: 0.06
Nodes (33): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, @fastify/multipart, @fastify/static, @fastify/websocket, ffmpeg-static (+25 more)

### Community 34 - "agentic-remote"
Cohesion: 0.14
Nodes (30): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+22 more)

### Community 35 - "hub-routes.ts"
Cohesion: 0.07
Nodes (32): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+24 more)

### Community 36 - "app.ts"
Cohesion: 0.10
Nodes (18): prefixes, session, trusted, untrusted, buildApp(), errorStatusCode(), transcriptionComputerName(), FileUploadError (+10 more)

### Community 37 - ".replyUserInputInternal"
Cohesion: 0.12
Nodes (7): isForegroundCompletionEvent(), isForegroundLifecycleEvent(), persistedFormAnswer(), statusFromEvents(), PendingUserInput, SessionStatus, UserInputReplyInput

### Community 38 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (28): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+20 more)

### Community 39 - "computer-manager-metadata.test.ts"
Cohesion: 0.11
Nodes (12): fixture(), managers, releases, remote, session(), ComputerRegistry, RegistryState, directories (+4 more)

### Community 40 - "CopilotSessionLike"
Cohesion: 0.10
Nodes (13): CopilotSessionLike, terminalFormSteps(), configurableModel(), directories, FakeCopilotClient, services, startupFifoFixture(), CopilotTasksApi (+5 more)

### Community 41 - "session-knowledge-routes.test.ts"
Cohesion: 0.11
Nodes (14): WorkspaceFixtureState, ServerRole, SessionMetadataLookup, KnowledgeState, KnowledgeStore, directories, disk, fixture() (+6 more)

### Community 42 - ".handleSessionEvent"
Cohesion: 0.19
Nodes (23): activityKind(), activityResult(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), isBackgroundTaskEvent(), isUnsupportedBackgroundTaskError() (+15 more)

### Community 43 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 44 - "directory-browser.ts"
Cohesion: 0.18
Nodes (13): DirectoryScope, displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin() (+5 more)

### Community 45 - "SessionKnowledgeStore"
Cohesion: 0.18
Nodes (4): bindingKey(), SessionKnowledgeRecoveryError, SessionKnowledgeStore, SessionKnowledgeBinding

### Community 46 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 47 - "app-icon.ts"
Cohesion: 0.21
Nodes (18): renderIcon(), root, root, appIconStorageKey, applyAppIcon(), AppIconColor, appIconColors, AppIconPreference (+10 more)

### Community 48 - "active-sessions.ts"
Cohesion: 0.19
Nodes (23): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+15 more)

### Community 49 - "transcription-service.ts"
Cohesion: 0.11
Nodes (19): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+11 more)

### Community 50 - "NewSessionDialog"
Cohesion: 0.14
Nodes (23): provider(), activateSession(), createSession(), executeCommand(), listDirectories(), listWorkspace(), validateSessionDirectory(), AddKnowledgeRootDialog() (+15 more)

### Community 51 - "PushNotificationService"
Cohesion: 0.25
Nodes (3): BuildAppOptions, PushNotificationService, registerPushRoutes()

### Community 52 - "delegated-transcription-service.ts"
Cohesion: 0.14
Nodes (11): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, AudioUpload (+3 more)

### Community 53 - "submission-error.ts"
Cohesion: 0.14
Nodes (17): RemoteNodeRedirectError, RemoteNodeRequestError, httpDeliveryUncertain(), legacyDefinitiveHttpRefusals, parseSubmissionReceipt(), SubmissionError, SubmissionReceipt, submissionReceiptFromError() (+9 more)

### Community 54 - "session-knowledge-store.ts"
Cohesion: 0.10
Nodes (20): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+12 more)

### Community 55 - "noTmuxServer"
Cohesion: 0.12
Nodes (14): noTmuxServer(), processGone(), procVisible(), socketIdentity(), directories, { execute }, files, links (+6 more)

### Community 56 - "capture-workspace.ts"
Cohesion: 0.20
Nodes (20): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+12 more)

### Community 57 - "HubEvent"
Cohesion: 0.11
Nodes (14): WorkspaceFixture, ComputerManagerEvents, brief(), HubEventSource, PushSender, PushState, directories, RFC-8030 (+6 more)

### Community 58 - "session-clear-transcript.test.ts"
Cohesion: 0.11
Nodes (9): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions, disk, fixtures, gate(), holdTurnWrite() (+1 more)

### Community 59 - "session-reply-durability.test.ts"
Cohesion: 0.16
Nodes (17): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRequest() (+9 more)

### Community 60 - "knowledge-tree.ts"
Cohesion: 0.17
Nodes (18): WorkspaceEntry, knowledgeTreeKeyDown(), toggleKnowledgeFolder(), collapseKnowledgeFolder(), expandKnowledgeFolder(), knowledgeAncestors(), KnowledgeCrumb, knowledgeCrumbs() (+10 more)

### Community 61 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 62 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 63 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 64 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 65 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 66 - "normalizeKnowledgeRelativePath"
Cohesion: 0.22
Nodes (15): joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath(), slashPath(), scopedKnowledgeRoot(), KnowledgeRootChoice (+7 more)

### Community 67 - "session-knowledge-store.test.ts"
Cohesion: 0.15
Nodes (12): disk, fixture(), fixtures, releases, root(), disk, fixture(), fixtures (+4 more)

### Community 68 - "use-session-knowledge-root.ts"
Cohesion: 0.21
Nodes (12): getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey(), knowledgePositionForBinding(), SessionIdentity (+4 more)

### Community 69 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 70 - "workspace-fixtures.ts"
Cohesion: 0.16
Nodes (14): documents, FIXTURE_NOW, fixtureBackgroundTasks, fixtureComputers, fixtureEndpoints, fixtureKnowledgeListings, fixtureKnowledgePositions, fixtureKnowledgeRoots (+6 more)

### Community 71 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 72 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 73 - "capture"
Cohesion: 0.18
Nodes (15): releaseRecording(), shortcutKeys(), startRecording(), stopRecording(), binding(), bindingLabel(), capturableCode(), isModifierCode() (+7 more)

### Community 74 - "check-workspace-review-regressions.ts"
Cohesion: 0.15
Nodes (11): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+3 more)

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

### Community 79 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 80 - "session-knowledge-routes.ts"
Cohesion: 0.15
Nodes (7): Lineage, RegistrationGeneration, ReplacementEvidence, SessionKnowledgeLifecycle, sessionParams, updateSchema, SessionKnowledgeConflictError

### Community 81 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 82 - "session-response-order.ts"
Cohesion: 0.27
Nodes (11): sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), currentSessionEventSequence(), nextSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences (+3 more)

### Community 83 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+4 more)

### Community 84 - "promotion-monitor.test.ts"
Cohesion: 0.30
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 85 - "recovery-seed-guards.test.ts"
Cohesion: 0.18
Nodes (8): bootLegacy(), directories, execute, pending, releases, SeedState, services, stores

### Community 86 - "session-resource-clear.test.ts"
Cohesion: 0.18
Nodes (11): apps, directories, directory(), obstructUploads(), pairedFixture(), providers, seed(), sockets (+3 more)

### Community 87 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 88 - ".oxlintrc.json"
Cohesion: 0.20
Nodes (9): ignorePatterns, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/**, graphify/.venv/** (+1 more)

### Community 90 - "session-enqueue-clear.test.ts"
Cohesion: 0.29
Nodes (9): disk, EnqueueCase, fixtures, gate(), holdEnqueue(), joinedEnqueue(), quiet(), releases (+1 more)

### Community 91 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 92 - "setupWorkspaceFixture"
Cohesion: 0.25
Nodes (6): pageFor(), createWorkspaceFixtureState(), fixtureBaseUrl(), fixtureValue(), setupWorkspaceFixture(), fixtureApi()

### Community 93 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 94 - "KnowledgePosition"
Cohesion: 0.33
Nodes (5): WorkspaceFixtureOptions, KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 95 - "DocumentViewControls.tsx"
Cohesion: 0.29
Nodes (4): DocumentViewControls(), actions, outline, DocumentHeading

### Community 96 - ".handleSessionMetadata"
Cohesion: 0.33
Nodes (3): channels, directories, observe()

### Community 97 - "recovery-context.ts"
Cohesion: 0.38
Nodes (4): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief

### Community 98 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 99 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 100 - "release-publication.test.ts"
Cohesion: 0.40
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 101 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

## Knowledge Gaps
- **651 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+646 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 979 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `.handleSessionMetadata`, `contracts.ts`, `.replyUserInputInternal`, `claude-agent-service.ts`, `SessionStore`, `.handleSessionEvent`, `.readAfterWrites`, `directory-browser.ts`, `queued-dispatch.test.ts`, `.get`, `agent-service.ts`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **Why does `connect()` connect `SessionStore` to `ProviderSessionService`, `SessionDetail`, `.get`, `AgentService`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionStore` to `.handleSessionMetadata`, `contracts.ts`, `SessionDetail`, `.replyUserInputInternal`, `claude-agent-service.ts`, `AgentService`, `.readAfterWrites`, `session-store.ts`, `queued-dispatch.test.ts`, `.get`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `App()` (e.g. with `readAppIconPreference()` and `readAccentTheme()`) actually correct?**
  _`App()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _651 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.036048458583669854 - nodes in this community are weakly interconnected._
- **Should `contracts.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.03539282990083906 - nodes in this community are weakly interconnected._
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
- `public/icons/app/app-atlas-agentic-180.png`
- `public/icons/app/app-atlas-ember-180.png`
- `public/icons/app/app-atlas-ocean-180.png`
- `public/icons/app/app-atlas-rose-180.png`
- `public/icons/app/app-atlas-teal-180.png`
- `public/icons/app/app-atlas-violet-180.png`
- `public/icons/app/app-beacon-agentic-180.png`
- `public/icons/app/app-beacon-ember-180.png`
- `public/icons/app/app-beacon-ocean-180.png`
- `public/icons/app/app-beacon-rose-180.png`
- `public/icons/app/app-beacon-teal-180.png`
- `public/icons/app/app-beacon-violet-180.png`
- `public/icons/app/app-bridge-agentic-180.png`
- `public/icons/app/app-bridge-ember-180.png`
- `public/icons/app/app-bridge-ocean-180.png`
- `public/icons/app/app-bridge-rose-180.png`
- `public/icons/app/app-bridge-teal-180.png`
- `public/icons/app/app-bridge-violet-180.png`
- `public/icons/app/app-orbit-agentic-180.png`
- `public/icons/app/app-orbit-ember-180.png`
- `public/icons/app/app-orbit-ocean-180.png`
- `public/icons/app/app-orbit-rose-180.png`
- `public/icons/app/app-orbit-teal-180.png`
- `public/icons/app/app-orbit-violet-180.png`
- `public/icons/app/app-relay-agentic-180.png`
- `public/icons/app/app-relay-ember-180.png`
- `public/icons/app/app-relay-ocean-180.png`
- `public/icons/app/app-relay-rose-180.png`
- `public/icons/app/app-relay-teal-180.png`
- `public/icons/app/app-relay-violet-180.png`
- `public/icons/apple-touch-icon.png`
- `public/icons/icon-192.png`
- `public/icons/icon-512-maskable.png`
- `public/icons/icon-512.png`
- `public/manifest.webmanifest`
- `shell/README.md`
- `shell/index.html`
- `shell/src/settings.css`
- `src/index.css`
