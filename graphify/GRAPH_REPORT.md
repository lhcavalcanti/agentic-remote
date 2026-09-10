# Agentic Remote - Graphify code map

Snapshot: `4817bbc4ef54273ffd756b0f171daefdaec252e4efe49579f3fe1c861cef673e`

Source checkout: `787d6854357b6301190ff6be800e6d3180a07e4c`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 218 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 218 files · ~442,104 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3370 nodes · 9479 edges · 140 communities (106 shown, 21 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 707 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- SessionDetail
- App
- AgentService
- api.ts
- App.tsx
- background-task-adapter.ts
- ClaudeAgentService
- contracts.ts
- SessionKnowledgeStore
- agentic-remote-promotion-monitor
- claude-agent-service.ts
- remote-node-client.ts
- session-presentation.ts
- markdown-navigation.ts
- SessionService
- agent-service.ts
- .readAfterWrites
- ComputerManager
- terminal-session.ts
- TmuxTerminalSessionController
- RemoteNodeClient
- bundle
- queued-provider-dispatch.test.ts
- pwa.ts
- FakeSessionService
- terminal-startup-queue.test.ts
- lib.rs
- ProviderSessionService
- shell.ts
- .publish
- config.rs
- devDependencies
- dependencies
- agentic-remote
- hub-routes.ts
- agentic-remote-promotion-setup
- session-knowledge-routes.test.ts
- knowledge-tree.ts
- terminal-session.test.ts
- .replyUserInputInternal
- scripts
- session-store-providers.test.ts
- PushNotificationService
- compilerOptions
- active-sessions.ts
- directory-browser.ts
- transcription-service.ts
- session-clear-transcript.test.ts
- noTmuxServer
- capture-workspace.ts
- CopilotSessionLike
- ResourceReads
- ComputerSummary
- compilerOptions
- compilerOptions
- compilerOptions
- event-log.ts
- session-reply-durability.test.ts
- workspace-browser.ts
- delegated-transcription-service.ts
- use-session-knowledge-root.ts
- workspace-fixtures.ts
- ReaderWorkspace
- app.ts
- queued-dispatch.test.ts
- recovery-resend-durability.test.ts
- session-resource-routes.test.ts
- NewSessionDialog
- api.test.ts
- capture
- check-workspace-review-regressions.ts
- desktop.json
- .claimFailure
- capture-workbench-review.ts
- package.json
- .oxlintrc.json
- settings-local.json
- push-notification-service.ts
- TranscriptionError
- promotion-monitor.test.ts
- recovery-seed-guards.test.ts
- html-preview.ts
- scripts
- CopilotClientLike
- TranscriptionService
- session-admission-lifecycle.test.ts
- ComputerRegistry
- session-resource-providers.test.ts
- session-store-durability.test.ts
- DeferredSession
- file-upload-routes.ts
- session-enqueue-clear.test.ts
- bridge.rs
- setupWorkspaceFixture
- screenshot-stability.test.ts
- KnowledgeRootChoices.tsx
- KnowledgePosition
- conversation-recovery.test.ts
- DocumentViewControls.tsx
- recovery-context.ts
- tmux-errors.integration.test.ts
- settings.ts
- toolActivityContent
- composer-layout.test.ts
- release-publication.test.ts
- session-navigation-view.test.ts
- removeComputer
- MarkdownCodeBlock.tsx
- .discoverTerminalSessions
- terminal-send-uncertainty.test.ts
- hasRunningBackgroundAgent
- MockMediaRecorder
- MermaidDiagram.tsx
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
2. `App()` - 227 edges
3. `AgentService` - 217 edges
4. `SessionStore` - 150 edges
5. `ClaudeAgentService` - 118 edges
6. `ComputerManager` - 79 edges
7. `SessionService` - 70 edges
8. `RemoteNodeClient` - 65 edges
9. `registerHubRoutes()` - 59 edges
10. `TmuxTerminalSessionController` - 55 edges

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

## Communities (140 total, 21 thin omitted)

### Community 0 - "SessionDetail"
Cohesion: 0.03
Nodes (54): fixture(), holdProbe(), fixtures, gate(), releases, connect(), createStore(), deferred() (+46 more)

### Community 1 - "App"
Cohesion: 0.04
Nodes (131): deleteSession(), recoverConversation(), transcribeAudio(), uploadSessionFile(), activeComposerPastes(), App(), adoptConversationReplacement(), appendComposerForKey() (+123 more)

### Community 2 - "AgentService"
Cohesion: 0.05
Nodes (8): agentMode(), AgentService, isMissingSessionError(), isRuntimeReasoningEffort(), removeCopilotSessionFiles(), RuntimeConfigurationError, fixture(), httpBoundary()

### Community 3 - "api.ts"
Cohesion: 0.04
Nodes (96): httpDeliveryUncertain(), legacyDefinitiveHttpRefusals, parseSubmissionReceipt(), submissionReceiptFromError(), addKnowledgeRoot(), cancelBackgroundTask(), cancelSession(), clearConversation() (+88 more)

### Community 4 - "App.tsx"
Cohesion: 0.03
Nodes (86): accentIconUrl(), applyAccentIcon(), configureRuntime(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation() (+78 more)

### Community 5 - "background-task-adapter.ts"
Cohesion: 0.05
Nodes (84): addActivity(), attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), boundedText(), CopilotTaskInfo (+76 more)

### Community 6 - "ClaudeAgentService"
Cohesion: 0.06
Nodes (12): ClaudeAgentService, isMissingClaudeSessionError(), cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle() (+4 more)

### Community 7 - "contracts.ts"
Cohesion: 0.05
Nodes (45): ComputerManagerEvents, RemoteResync, RemoteSessionRead, directories, provider(), ResourceRead, ActivityStatus, AddComputerInput (+37 more)

### Community 8 - "SessionKnowledgeStore"
Cohesion: 0.06
Nodes (38): Lineage, registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession() (+30 more)

### Community 9 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (67): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+59 more)

### Community 10 - "claude-agent-service.ts"
Cohesion: 0.08
Nodes (52): AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission, PendingClaudeReply (+44 more)

### Community 11 - "remote-node-client.ts"
Cohesion: 0.04
Nodes (46): ClaudeAgentServiceEvents, managers, releases, remote, RegistryState, NodeIdentityStore, StoredNodeIdentity, AUDIO_FILENAME_HEADER (+38 more)

### Community 12 - "session-presentation.ts"
Cohesion: 0.07
Nodes (46): react, SessionMcpServerSummary, SessionResourceSource, SessionSkillSummary, DialogFrame(), KnowledgeRootSelector(), root, SessionFilter (+38 more)

### Community 13 - "markdown-navigation.ts"
Cohesion: 0.07
Nodes (50): UserInputField, UserInputFieldValue, followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), MarkdownImage(), missingDocumentFragment(), WorkspaceDialog() (+42 more)

### Community 14 - "SessionService"
Cohesion: 0.07
Nodes (14): registerNodeRoutes(), apps, directories, directory(), obstructUploads(), pairedFixture(), providerFixture(), providers (+6 more)

### Community 15 - "agent-service.ts"
Cohesion: 0.05
Nodes (47): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), ActivityToolStart, AgentServiceEvents, ansiSequence, commandShortcut() (+39 more)

### Community 16 - ".readAfterWrites"
Cohesion: 0.10
Nodes (4): preparePrompt(), queueConflict(), QueuedPromptReservation, TerminalSessionController

### Community 17 - "ComputerManager"
Cohesion: 0.16
Nodes (7): ComputerManager, managedSession(), RemoteSessionListing, registerHubRoutes(), ManagedRemovedQueuedPrompt, ManagedSession, SessionListing

### Community 18 - "terminal-session.ts"
Cohesion: 0.11
Nodes (43): activeBottomFrame(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), COMPOSER_PLACEHOLDERS, containsCopiedInteractiveFrame(), desktopInstallPromptIdentity(), findTerminalWrappedText() (+35 more)

### Community 19 - "TmuxTerminalSessionController"
Cohesion: 0.12
Nodes (14): copilotCommand(), execFileAsync, listTmuxSessions(), parseTerminalFormActiveField(), processAncestors(), processCommand(), safeWindowName(), submitTerminalForm() (+6 more)

### Community 20 - "RemoteNodeClient"
Cohesion: 0.07
Nodes (6): RemoteNodeClient, BackgroundTaskSnapshot, RemovedQueuedPrompt, WorkspaceFile, WorkspaceListing, KnowledgeFolderState

### Community 21 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 22 - "queued-provider-dispatch.test.ts"
Cohesion: 0.08
Nodes (20): acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight(), QueuedDelivery, QueuedDispatches (+12 more)

### Community 23 - "pwa.ts"
Cohesion: 0.09
Nodes (37): directories, AppVersion, parseAppVersion(), getProviderRuntimeOptions(), getPushPublicKey(), savePushSubscription(), sendTestPushNotification(), applyPwaUpdate() (+29 more)

### Community 24 - "FakeSessionService"
Cohesion: 0.06
Nodes (4): FakeSessionService, routingFixture(), session(), temporaryDirectory()

### Community 25 - "terminal-startup-queue.test.ts"
Cohesion: 0.10
Nodes (33): directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), exec, formFixture(), directories (+25 more)

### Community 26 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 28 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 29 - ".publish"
Cohesion: 0.13
Nodes (17): activityKind(), activityResult(), eventAgentId(), isBackgroundTaskEvent(), isForegroundCompletionEvent(), isForegroundLifecycleEvent(), isUnsupportedBackgroundTaskError(), messagesFromHistory() (+9 more)

### Community 30 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 31 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 32 - "dependencies"
Cohesion: 0.06
Nodes (33): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/static, @fastify/websocket, ffmpeg-static (+25 more)

### Community 33 - "agentic-remote"
Cohesion: 0.14
Nodes (30): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+22 more)

### Community 34 - "hub-routes.ts"
Cohesion: 0.07
Nodes (28): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+20 more)

### Community 35 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (28): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+20 more)

### Community 36 - "session-knowledge-routes.test.ts"
Cohesion: 0.10
Nodes (15): ServerRole, SessionMetadataLookup, KnowledgeState, KnowledgeStore, directories, disk, FakeManager, fixture() (+7 more)

### Community 37 - "knowledge-tree.ts"
Cohesion: 0.11
Nodes (27): WorkspaceEntry, listKnowledgeEntries(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeTreeKeyDown(), loadKnowledgeChain() (+19 more)

### Community 38 - "terminal-session.test.ts"
Cohesion: 0.10
Nodes (26): composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), occurrences(), paneEvidenceCount(), paneShowsText(), parseTerminalUpdateNotice() (+18 more)

### Community 39 - ".replyUserInputInternal"
Cohesion: 0.15
Nodes (5): persistedFormAnswer(), TerminalFormContinuation, TerminalFormReplyError, PendingUserInput, UserInputReplyInput

### Community 40 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 41 - "session-store-providers.test.ts"
Cohesion: 0.10
Nodes (12): claude(), clearFixture(), copilot(), disk, event(), fixture(), fixtures, holdOtherWrite() (+4 more)

### Community 42 - "PushNotificationService"
Cohesion: 0.19
Nodes (3): HubEventSource, PushNotificationService, registerPushRoutes()

### Community 43 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 44 - "active-sessions.ts"
Cohesion: 0.19
Nodes (23): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+15 more)

### Community 45 - "directory-browser.ts"
Cohesion: 0.18
Nodes (13): DirectoryScope, displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin() (+5 more)

### Community 46 - "transcription-service.ts"
Cohesion: 0.11
Nodes (19): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+11 more)

### Community 47 - "session-clear-transcript.test.ts"
Cohesion: 0.11
Nodes (10): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions, disk, fixture(), fixtures, gate() (+2 more)

### Community 48 - "noTmuxServer"
Cohesion: 0.12
Nodes (14): noTmuxServer(), processGone(), procVisible(), socketIdentity(), directories, { execute }, files, links (+6 more)

### Community 49 - "capture-workspace.ts"
Cohesion: 0.20
Nodes (20): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+12 more)

### Community 50 - "CopilotSessionLike"
Cohesion: 0.12
Nodes (9): CopilotSessionLike, terminalFormSteps(), configurableModel(), directories, FakeCopilotClient, services, startupFifoFixture(), CopilotTasksApi (+1 more)

### Community 51 - "ResourceReads"
Cohesion: 0.13
Nodes (13): ActiveClaudeQuery, releases, session, snapshot, readClaudeMcp(), readCopilotResource(), copilotTransport(), disposals (+5 more)

### Community 52 - "ComputerSummary"
Cohesion: 0.18
Nodes (5): fixture(), session(), sessionAtLeastAsNew(), RegisteredComputer, ComputerSummary

### Community 53 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 54 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 55 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 56 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 57 - "session-reply-durability.test.ts"
Cohesion: 0.18
Nodes (15): assistantFixture(), claudeFixture(), claudeQuestions(), claudeRunFixture(), copilotFixture(), copilotRunFixture(), disk, fallbackFormFixture() (+7 more)

### Community 58 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 59 - "delegated-transcription-service.ts"
Cohesion: 0.16
Nodes (9): collect(), DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, AudioUpload, MAX_AUDIO_BYTES (+1 more)

### Community 60 - "use-session-knowledge-root.ts"
Cohesion: 0.19
Nodes (12): getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey(), knowledgePositionForBinding(), SessionIdentity (+4 more)

### Community 61 - "workspace-fixtures.ts"
Cohesion: 0.15
Nodes (15): documents, FIXTURE_NOW, fixtureBackgroundTasks, fixtureEndpoints, fixtureKnowledgeListings, fixtureKnowledgePositions, fixtureKnowledgeRoots, fixtureModels (+7 more)

### Community 62 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 63 - "app.ts"
Cohesion: 0.18
Nodes (10): prefixes, session, trusted, untrusted, buildApp(), errorStatusCode(), transcriptionComputerName(), port (+2 more)

### Community 64 - "queued-dispatch.test.ts"
Cohesion: 0.14
Nodes (9): accept(), deferred(), disk, fixture(), fixtures, holdWrite(), prompt(), releases (+1 more)

### Community 65 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 66 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 67 - "NewSessionDialog"
Cohesion: 0.20
Nodes (16): activateSession(), createSession(), listDirectories(), listHistory(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), moveSessionToBrowsedFolder() (+8 more)

### Community 68 - "api.test.ts"
Cohesion: 0.23
Nodes (13): sendMessage(), failWith(), sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), currentSessionEventSequence(), nextSessionEventSequence(), projectSessionResponse() (+5 more)

### Community 69 - "capture"
Cohesion: 0.18
Nodes (15): releaseRecording(), shortcutKeys(), startRecording(), stopRecording(), binding(), bindingLabel(), capturableCode(), isModifierCode() (+7 more)

### Community 70 - "check-workspace-review-regressions.ts"
Cohesion: 0.14
Nodes (12): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+4 more)

### Community 71 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 72 - ".claimFailure"
Cohesion: 0.30
Nodes (3): isUncertainDelivery(), deliveryUncertaintyFromError(), SubmissionError

### Community 73 - "capture-workbench-review.ts"
Cohesion: 0.17
Nodes (10): frame(), geometry, output, scratch, screenshot(), { values }, fixtureSessions, IDLE_SESSION_ID (+2 more)

### Community 74 - "package.json"
Cohesion: 0.15
Nodes (11): directory, { values }, workflows, name, packageManager, pnpm, onlyBuiltDependencies, private (+3 more)

### Community 75 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 76 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 77 - "push-notification-service.ts"
Cohesion: 0.15
Nodes (10): brief(), PushSender, PushState, directories, RFC-8030, RFC-8030, sessionMuteSchema, subscriptionSchema (+2 more)

### Community 78 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 79 - "promotion-monitor.test.ts"
Cohesion: 0.30
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 80 - "recovery-seed-guards.test.ts"
Cohesion: 0.18
Nodes (8): bootLegacy(), directories, execute, pending, releases, SeedState, services, stores

### Community 81 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 82 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, check, dev, dev:server, dev:web, lint, start (+3 more)

### Community 83 - "CopilotClientLike"
Cohesion: 0.18
Nodes (5): CopilotClientLike, boots, [directory, backend, resultPath, phase = 'idle'], fixtureRoot, CopilotResourceClient

### Community 84 - "TranscriptionService"
Cohesion: 0.25
Nodes (5): BuildAppOptions, DelegatedTranscriptionOptions, registerTranscriptionRoutes(), transcriptionMultipartOptions, TranscriptionService

### Community 85 - "session-admission-lifecycle.test.ts"
Cohesion: 0.22
Nodes (8): ClaudeSdk, deferred(), disk, enqueue(), fixture(), fixtures, holdAdmissionWrite(), releases

### Community 86 - "ComputerRegistry"
Cohesion: 0.27
Nodes (3): ComputerRegistry, directories, remoteSnapshotFixture()

### Community 87 - "session-resource-providers.test.ts"
Cohesion: 0.20
Nodes (10): ClaudeMcpRead, deferred(), DiscoveredMcp, DiscoveredSkills, fixtures, Mcp, pause(), releases (+2 more)

### Community 88 - "session-store-durability.test.ts"
Cohesion: 0.27
Nodes (7): disk, fixture(), fixtures, prompt(), ready(), releases, session()

### Community 90 - "file-upload-routes.ts"
Cohesion: 0.29
Nodes (6): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile()

### Community 91 - "session-enqueue-clear.test.ts"
Cohesion: 0.29
Nodes (9): disk, EnqueueCase, fixtures, gate(), holdEnqueue(), joinedEnqueue(), quiet(), releases (+1 more)

### Community 92 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 93 - "setupWorkspaceFixture"
Cohesion: 0.25
Nodes (6): pageFor(), createWorkspaceFixtureState(), fixtureBaseUrl(), fixtureValue(), setupWorkspaceFixture(), fixtureApi()

### Community 94 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 95 - "KnowledgeRootChoices.tsx"
Cohesion: 0.25
Nodes (7): KnowledgeRootChoice, KnowledgeRootChoices(), KnowledgeRootSession, actions, computers, root, session

### Community 96 - "KnowledgePosition"
Cohesion: 0.36
Nodes (4): WorkspaceFixtureOptions, KnowledgePosition, KnowledgeRestoreState, base

### Community 97 - "conversation-recovery.test.ts"
Cohesion: 0.25
Nodes (4): fixtures, recoverAndSeed(), recoveryFixture(), releases

### Community 98 - "DocumentViewControls.tsx"
Cohesion: 0.29
Nodes (4): DocumentViewControls(), actions, outline, DocumentHeading

### Community 99 - "recovery-context.ts"
Cohesion: 0.38
Nodes (4): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief

### Community 100 - "tmux-errors.integration.test.ts"
Cohesion: 0.43
Nodes (6): execFileAsync, headers, ignoreMissing(), removeFixture(), seedSession(), sessionLog()

### Community 101 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 102 - "toolActivityContent"
Cohesion: 0.40
Nodes (6): previewText(), readableMcpServerName(), readableToolName(), sameToolLabel(), stripAnsi(), toolActivityContent()

### Community 103 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 104 - "release-publication.test.ts"
Cohesion: 0.40
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 105 - "session-navigation-view.test.ts"
Cohesion: 0.33
Nodes (5): computers, first, grouped, hidden, last

### Community 106 - "removeComputer"
Cohesion: 0.60
Nodes (5): addComputer(), removeComputer(), ComputersDialog(), remove(), submit()

### Community 113 - "MermaidDiagram.tsx"
Cohesion: 0.67
Nodes (3): drawDiagram(), drawing, MermaidDiagram()

## Knowledge Gaps
- **644 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+639 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 969 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `SessionDetail`, `.replyUserInputInternal`, `.claimFailure`, `contracts.ts`, `claude-agent-service.ts`, `.discoverTerminalSessions`, `directory-browser.ts`, `.readAfterWrites`, `queued-provider-dispatch.test.ts`, `.publish`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `connect()` connect `SessionDetail` to `AgentService`, `ProviderSessionService`, `ClaudeAgentService`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `fixture()` connect `AgentService` to `SessionDetail`, `recovery-resend-durability.test.ts`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _644 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `SessionDetail` be split into smaller, more focused modules?**
  _Cohesion score 0.034083885209713026 - nodes in this community are weakly interconnected._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.037784456848432804 - nodes in this community are weakly interconnected._
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
