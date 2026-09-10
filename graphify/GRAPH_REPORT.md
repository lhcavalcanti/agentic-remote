# Agentic Remote - Graphify code map

Snapshot: `63f990f184a1d8589ca76d6bc70e67108cfda48e9bf4f8718d7b0546a9cf475a`

Source checkout: `f19f110dc6bb8fe6af5bbcab919f988ed9eb045d`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 218 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 218 files · ~443,141 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3373 nodes · 9493 edges · 142 communities (106 shown, 23 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 708 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App
- App.tsx
- api.ts
- SessionDetail
- AgentService
- contracts.ts
- session-presentation.ts
- SessionKnowledgeStore
- agentic-remote-promotion-monitor
- queueConflict
- markdown-navigation.ts
- claude-agent-service.ts
- agent-service.ts
- RemoteNodeClient
- terminal-session.ts
- TmuxTerminalSessionController
- ComputerManager
- FakeSessionService
- bundle
- CopilotSessionLike
- SessionStore
- ProviderSessionService
- .mutate
- background-task-adapter.ts
- lib.rs
- shell.ts
- config.rs
- .syncTranscripts
- pwa.ts
- SessionService
- devDependencies
- session-knowledge-routes.test.ts
- hub-routes.ts
- dependencies
- agentic-remote
- tmux-test-helpers.ts
- node-routes.ts
- .get
- knowledge-tree.ts
- sessionKey
- agentic-remote-promotion-setup
- terminal-session.test.ts
- TerminalSessionController
- .publish
- terminal-startup-queue.test.ts
- .readResources
- delegated-transcription-service.ts
- scripts
- session-store.ts
- PushNotificationService
- transcription-service.ts
- compilerOptions
- active-sessions.ts
- noTmuxServer
- capture-workspace.ts
- app.ts
- session-store-providers.test.ts
- session-enqueue-clear.test.ts
- compilerOptions
- compilerOptions
- check-workspace-review-regressions.ts
- compilerOptions
- directory-browser.ts
- session-resource-routes.test.ts
- session-admission-lifecycle.test.ts
- workspace-browser.ts
- SessionMcpServersSnapshot
- NodeIdentityStore
- session-reply-durability.test.ts
- recordValue
- ReaderWorkspace
- background-task-stop.test.ts
- queued-dispatch.test.ts
- recovery-resend-durability.test.ts
- queued-provider-dispatch.test.ts
- workspace-fixtures.ts
- desktop.json
- session-resource-clear.test.ts
- session-resource-providers.test.ts
- submission-error.ts
- BackgroundTasksDialog.tsx
- capture-workbench-review.ts
- package.json
- .oxlintrc.json
- settings-local.json
- push-notification-service.ts
- TranscriptionError
- session-response-order.ts
- background-task-tracker.ts
- ResourceReads
- promotion-monitor.test.ts
- recovery-seed-guards.test.ts
- SessionAdmissions
- html-preview.ts
- scripts
- claude-recovery-admission.test.ts
- session-resource-transport.ts
- DeferredSession
- session-clear-transcript.test.ts
- bridge.rs
- setupWorkspaceFixture
- screenshot-stability.test.ts
- remote-node-client.test.ts
- KnowledgePosition
- SubmissionError
- tmux-errors.integration.test.ts
- recovery-context.ts
- settings.ts
- composer-layout.test.ts
- release-publication.test.ts
- MarkdownCodeBlock.tsx
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
10. `TmuxTerminalSessionController` - 56 edges

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

## Communities (142 total, 23 thin omitted)

### Community 0 - "App"
Cohesion: 0.04
Nodes (117): deleteSession(), recoverConversation(), activeComposerPastes(), App(), adoptConversationReplacement(), appendComposerForKey(), appKeyDown(), applyComputerSnapshot() (+109 more)

### Community 1 - "App.tsx"
Cohesion: 0.03
Nodes (102): accentIconUrl(), applyAccentIcon(), configureRuntime(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation() (+94 more)

### Community 2 - "api.ts"
Cohesion: 0.04
Nodes (105): activateSession(), addKnowledgeRoot(), cancelBackgroundTask(), cancelSession(), clearConversation(), createSession(), definiteDispatchRefusals, dispatchQueuedPrompt() (+97 more)

### Community 3 - "SessionDetail"
Cohesion: 0.05
Nodes (7): ClaudeAgentService, isMissingClaudeSessionError(), answer(), claudeRequest(), copilotRequest(), RuntimeModelOption, SessionDetail

### Community 4 - "AgentService"
Cohesion: 0.06
Nodes (3): AgentService, fixture(), httpBoundary()

### Community 5 - "contracts.ts"
Cohesion: 0.07
Nodes (51): ClaudeAgentServiceEvents, managers, releases, remote, RegisteredComputer, RegistryState, DirectoryScope, directories (+43 more)

### Community 6 - "session-presentation.ts"
Cohesion: 0.05
Nodes (55): react, FakeManager, ComputerSummary, SessionMcpServerSummary, SessionResourceSource, SessionSkillSummary, KnowledgeRootChoice, KnowledgeRootChoices() (+47 more)

### Community 7 - "SessionKnowledgeStore"
Cohesion: 0.06
Nodes (38): Lineage, registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession() (+30 more)

### Community 8 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (67): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+59 more)

### Community 9 - "queueConflict"
Cohesion: 0.07
Nodes (17): acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight(), preparePrompt(), queueConflict() (+9 more)

### Community 10 - "markdown-navigation.ts"
Cohesion: 0.06
Nodes (54): UserInputField, UserInputFieldValue, followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), MarkdownImage(), missingDocumentFragment(), WorkspaceDialog() (+46 more)

### Community 11 - "claude-agent-service.ts"
Cohesion: 0.10
Nodes (48): AuthStatusRunner, ClaudeQuestion, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission, PendingClaudeReply, toolResultText() (+40 more)

### Community 12 - "agent-service.ts"
Cohesion: 0.04
Nodes (51): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), ActivityToolStart, AgentServiceEvents, ansiSequence, commandShortcut() (+43 more)

### Community 13 - "RemoteNodeClient"
Cohesion: 0.05
Nodes (9): RemoteResync, RemoteSessionRead, headerSafe(), RemoteNodeClient, NodeInfo, RemovedQueuedPrompt, WorkspaceFile, WorkspaceListing (+1 more)

### Community 14 - "terminal-session.ts"
Cohesion: 0.11
Nodes (47): activeBottomFrame(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), COMPOSER_PLACEHOLDERS, containsCopiedInteractiveFrame(), desktopInstallPromptIdentity(), findTerminalWrappedText() (+39 more)

### Community 15 - "TmuxTerminalSessionController"
Cohesion: 0.11
Nodes (14): TerminalFormContinuation, copilotCommand(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand(), safeWindowName(), submitTerminalForm() (+6 more)

### Community 16 - "ComputerManager"
Cohesion: 0.18
Nodes (7): ComputerManager, managedSession(), RemoteSessionListing, registerHubRoutes(), ManagedRemovedQueuedPrompt, ManagedSession, SessionListing

### Community 17 - "FakeSessionService"
Cohesion: 0.06
Nodes (4): FakeSessionService, routingFixture(), session(), temporaryDirectory()

### Community 18 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 19 - "CopilotSessionLike"
Cohesion: 0.05
Nodes (20): CopilotClientLike, CopilotSessionLike, holdProbe(), fixtures, gate(), releases, terminalFormSteps(), configurableModel() (+12 more)

### Community 20 - "SessionStore"
Cohesion: 0.12
Nodes (13): fixture(), recoveryFixture(), fixture(), fixture(), fixture(), fixture(), fixture(), isSessionIdList() (+5 more)

### Community 22 - ".mutate"
Cohesion: 0.08
Nodes (6): isUncertainDelivery(), observe(), clearRecoverySeedFailure(), cloneSession(), ownsRecoverySeedFailure(), deliveryUncertaintyFromError()

### Community 23 - "background-task-adapter.ts"
Cohesion: 0.12
Nodes (39): attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), CopilotTaskInfo, CopilotTaskProgress, eventString() (+31 more)

### Community 24 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 25 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 26 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 27 - ".syncTranscripts"
Cohesion: 0.13
Nodes (23): activityKind(), activityResult(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), isBackgroundTaskEvent(), isForegroundCompletionEvent() (+15 more)

### Community 28 - "pwa.ts"
Cohesion: 0.11
Nodes (34): deletePushSubscription(), getPushPublicKey(), savePushSubscription(), sendTestPushNotification(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate() (+26 more)

### Community 30 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 31 - "session-knowledge-routes.test.ts"
Cohesion: 0.09
Nodes (19): WorkspaceFixtureState, ServerRole, SessionMetadataLookup, KnowledgeState, KnowledgeStore, directories, disk, fixture() (+11 more)

### Community 32 - "hub-routes.ts"
Cohesion: 0.07
Nodes (29): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+21 more)

### Community 33 - "dependencies"
Cohesion: 0.06
Nodes (33): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/static, @fastify/websocket, ffmpeg-static (+25 more)

### Community 34 - "agentic-remote"
Cohesion: 0.14
Nodes (30): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+22 more)

### Community 35 - "tmux-test-helpers.ts"
Cohesion: 0.13
Nodes (26): directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), exec, formFixture(), horizontalFormFixture() (+18 more)

### Community 36 - "node-routes.ts"
Cohesion: 0.08
Nodes (27): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile(), AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER (+19 more)

### Community 38 - "knowledge-tree.ts"
Cohesion: 0.11
Nodes (28): WorkspaceEntry, listKnowledgeEntries(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeTreeKeyDown(), loadKnowledgeChain() (+20 more)

### Community 39 - "sessionKey"
Cohesion: 0.10
Nodes (26): getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), resumeSession(), SessionKnowledgeRequestError, suspendSession(), updateSessionKnowledgeRoot(), cancelSelectedBackgroundTask(), created() (+18 more)

### Community 40 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (28): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+20 more)

### Community 41 - "terminal-session.test.ts"
Cohesion: 0.10
Nodes (27): composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), occurrences(), paneEvidenceCount(), paneShowsText(), parseTerminalUpdateNotice() (+19 more)

### Community 44 - "terminal-startup-queue.test.ts"
Cohesion: 0.14
Nodes (25): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+17 more)

### Community 45 - ".readResources"
Cohesion: 0.11
Nodes (3): fixture(), session(), sessionAtLeastAsNew()

### Community 46 - "delegated-transcription-service.ts"
Cohesion: 0.12
Nodes (13): BuildAppOptions, collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation (+5 more)

### Community 47 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 48 - "session-store.ts"
Cohesion: 0.08
Nodes (19): channels, directories, activityDuration(), activityResultPreview(), archivedMessage(), DiscoveredSession, emptyRetirements, PendingChange (+11 more)

### Community 49 - "PushNotificationService"
Cohesion: 0.19
Nodes (3): HubEventSource, PushNotificationService, registerPushRoutes()

### Community 50 - "transcription-service.ts"
Cohesion: 0.10
Nodes (20): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+12 more)

### Community 51 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 52 - "active-sessions.ts"
Cohesion: 0.19
Nodes (23): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+15 more)

### Community 53 - "noTmuxServer"
Cohesion: 0.12
Nodes (14): noTmuxServer(), processGone(), procVisible(), socketIdentity(), directories, { execute }, files, links (+6 more)

### Community 54 - "capture-workspace.ts"
Cohesion: 0.20
Nodes (20): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+12 more)

### Community 55 - "app.ts"
Cohesion: 0.15
Nodes (13): prefixes, session, trusted, untrusted, directories, buildApp(), errorStatusCode(), transcriptionComputerName() (+5 more)

### Community 56 - "session-store-providers.test.ts"
Cohesion: 0.11
Nodes (10): claude(), clearFixture(), copilot(), disk, event(), fixtures, holdOtherWrite(), releases (+2 more)

### Community 57 - "session-enqueue-clear.test.ts"
Cohesion: 0.14
Nodes (16): disk, EnqueueCase, fixtures, gate(), holdEnqueue(), joinedEnqueue(), quiet(), releases (+8 more)

### Community 58 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 59 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 60 - "check-workspace-review-regressions.ts"
Cohesion: 0.13
Nodes (15): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+7 more)

### Community 61 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 62 - "directory-browser.ts"
Cohesion: 0.23
Nodes (11): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin(), SessionDirectoryError (+3 more)

### Community 63 - "session-resource-routes.test.ts"
Cohesion: 0.13
Nodes (9): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription (+1 more)

### Community 64 - "session-admission-lifecycle.test.ts"
Cohesion: 0.12
Nodes (13): ClaudeSdk, cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle(), deferred() (+5 more)

### Community 65 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 66 - "SessionMcpServersSnapshot"
Cohesion: 0.13
Nodes (9): ClaudeResources, ManagedSessionMcpServersSnapshot, ManagedSessionSkillsSnapshot, SessionMcpServersSnapshot, SessionResourceSnapshot, SessionSkillsSnapshot, mcp, session (+1 more)

### Community 67 - "NodeIdentityStore"
Cohesion: 0.18
Nodes (4): ComputerRegistry, directories, remoteSnapshotFixture(), NodeIdentityStore

### Community 68 - "session-reply-durability.test.ts"
Cohesion: 0.18
Nodes (14): assistantFixture(), claudeFixture(), claudeQuestions(), claudeRunFixture(), copilotFixture(), copilotRunFixture(), disk, fallbackFormFixture() (+6 more)

### Community 69 - "recordValue"
Cohesion: 0.20
Nodes (17): addActivity(), boundedText(), errorValue(), notificationKind(), parsedValue(), recordValue(), shellExitFromValue(), shellIdFromFooter() (+9 more)

### Community 70 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 71 - "background-task-stop.test.ts"
Cohesion: 0.21
Nodes (13): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), snapshot() (+5 more)

### Community 72 - "queued-dispatch.test.ts"
Cohesion: 0.14
Nodes (9): accept(), deferred(), disk, fixture(), fixtures, holdWrite(), prompt(), releases (+1 more)

### Community 73 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 74 - "queued-provider-dispatch.test.ts"
Cohesion: 0.17
Nodes (9): claudeFixture(), copilotFixture(), copilotSession(), fixtures, gate(), originalQueue, pause(), releases (+1 more)

### Community 75 - "workspace-fixtures.ts"
Cohesion: 0.15
Nodes (13): documents, FIXTURE_NOW, fixtureBackgroundTasks, fixtureEndpoints, fixtureKnowledgeListings, fixtureKnowledgePositions, fixtureModels, PERMISSION_SESSION_ID (+5 more)

### Community 76 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 77 - "session-resource-clear.test.ts"
Cohesion: 0.19
Nodes (13): apps, directories, directory(), obstructUploads(), pairedFixture(), providerFixture(), providers, seed() (+5 more)

### Community 78 - "session-resource-providers.test.ts"
Cohesion: 0.22
Nodes (13): claudeFixture(), ClaudeMcpRead, copilotFixture(), deferred(), directory(), DiscoveredMcp, DiscoveredSkills, fixtures (+5 more)

### Community 79 - "submission-error.ts"
Cohesion: 0.19
Nodes (13): httpDeliveryUncertain(), legacyDefinitiveHttpRefusals, parseSubmissionReceipt(), submissionReceiptFromError(), addComputer(), deleteKnowledgeRoot(), removeComputer(), requestVoid() (+5 more)

### Community 80 - "BackgroundTasksDialog.tsx"
Cohesion: 0.23
Nodes (10): DialogFrame(), BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive() (+2 more)

### Community 81 - "capture-workbench-review.ts"
Cohesion: 0.17
Nodes (10): frame(), geometry, output, scratch, screenshot(), { values }, fixtureSessions, IDLE_SESSION_ID (+2 more)

### Community 82 - "package.json"
Cohesion: 0.15
Nodes (11): directory, { values }, workflows, name, packageManager, pnpm, onlyBuiltDependencies, private (+3 more)

### Community 83 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 84 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 85 - "push-notification-service.ts"
Cohesion: 0.15
Nodes (10): brief(), PushSender, PushState, directories, RFC-8030, RFC-8030, sessionMuteSchema, subscriptionSchema (+2 more)

### Community 86 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 87 - "session-response-order.ts"
Cohesion: 0.27
Nodes (11): sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), currentSessionEventSequence(), nextSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences (+3 more)

### Community 88 - "background-task-tracker.ts"
Cohesion: 0.30
Nodes (6): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 89 - "ResourceReads"
Cohesion: 0.21
Nodes (6): ActiveClaudeQuery, releases, session, snapshot, ResourceReads, resourceRequestHandler()

### Community 90 - "promotion-monitor.test.ts"
Cohesion: 0.30
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 91 - "recovery-seed-guards.test.ts"
Cohesion: 0.18
Nodes (8): bootLegacy(), directories, execute, pending, releases, SeedState, services, stores

### Community 92 - "SessionAdmissions"
Cohesion: 0.20
Nodes (4): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions

### Community 93 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 94 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, check, dev, dev:server, dev:web, lint, start (+3 more)

### Community 95 - "claude-recovery-admission.test.ts"
Cohesion: 0.25
Nodes (9): connect(), createStore(), deferred(), disk, enqueue(), fixture(), fixtures, holdClaimWrite() (+1 more)

### Community 96 - "session-resource-transport.ts"
Cohesion: 0.27
Nodes (8): CopilotResourceClient, readClaudeMcp(), readCopilotResource(), copilotTransport(), disposals, Frame, write(), unavailable()

### Community 98 - "session-clear-transcript.test.ts"
Cohesion: 0.24
Nodes (6): disk, fixture(), fixtures, gate(), holdTurnWrite(), releases

### Community 99 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 100 - "setupWorkspaceFixture"
Cohesion: 0.25
Nodes (6): pageFor(), createWorkspaceFixtureState(), fixtureBaseUrl(), fixtureValue(), setupWorkspaceFixture(), fixtureApi()

### Community 101 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 102 - "remote-node-client.test.ts"
Cohesion: 0.28
Nodes (5): client(), servers, session, TERMINAL_REQUEST_TIMEOUT_MS, TERMINAL_STARTUP_TIMEOUT_MS

### Community 103 - "KnowledgePosition"
Cohesion: 0.36
Nodes (4): WorkspaceFixtureOptions, KnowledgePosition, KnowledgeRestoreState, base

### Community 104 - "SubmissionError"
Cohesion: 0.36
Nodes (4): RemoteNodeRedirectError, RemoteNodeRequestError, SubmissionError, SubmissionReceipt

### Community 105 - "tmux-errors.integration.test.ts"
Cohesion: 0.36
Nodes (7): execFileAsync, headers, ignoreMissing(), removeFixture(), seedSession(), sessionLog(), stopOwnedServer()

### Community 106 - "recovery-context.ts"
Cohesion: 0.38
Nodes (4): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief

### Community 107 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 108 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 109 - "release-publication.test.ts"
Cohesion: 0.40
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 110 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 115 - "MermaidDiagram.tsx"
Cohesion: 0.67
Nodes (3): drawDiagram(), drawing, MermaidDiagram()

## Knowledge Gaps
- **644 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+639 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 969 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **23 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `SessionMcpServersSnapshot`, `.get`, `queueConflict`, `TerminalSessionController`, `.publish`, `claude-agent-service.ts`, `session-store.ts`, `.mutate`, `.syncTranscripts`, `directory-browser.ts`, `session-resource-routes.test.ts`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `connect()` connect `claude-recovery-admission.test.ts` to `SessionDetail`, `AgentService`, `.get`, `SessionStore`, `ProviderSessionService`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `fixture()` connect `AgentService` to `recovery-resend-durability.test.ts`, `TerminalSessionController`, `SessionStore`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _644 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.04051712648274024 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.027638531364313778 - nodes in this community are weakly interconnected._
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
