# Agentic Remote - Graphify code map

Snapshot: `b4c561d41e2547defd686b0c26d482359d39a99bfdf3fdba9e137c8203d2363a`

Source checkout: `16bac4b47945708655a27999cfe44a1f46e96a4d`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 189 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 189 files · ~403,578 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3161 nodes · 8789 edges · 127 communities (93 shown, 20 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 645 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App
- AgentService
- App.tsx
- api.ts
- SessionDetail
- SessionStore
- background-task-adapter.ts
- BackgroundTaskSnapshot
- SessionKnowledgeStore
- agentic-remote-promotion-monitor
- .sendAdmittedWithBackend
- claude-agent-service.ts
- session-store.ts
- agent-service.ts
- SessionService
- terminal-session.test.ts
- terminal-session.ts
- TmuxTerminalSessionController
- bundle
- ComputerManager
- lib.rs
- multi-node.test.ts
- contracts.ts
- RemoteNodeClient
- shell.ts
- config.rs
- session-knowledge-routes.test.ts
- ProviderSessionService
- FakeSessionService
- pwa.ts
- devDependencies
- dependencies
- agentic-remote
- .get
- WorkspaceDialog
- agentic-remote-promotion-setup
- computer-manager-metadata.test.ts
- node-routes.ts
- hub-routes.ts
- remote-node-client.ts
- scripts
- PushNotificationService
- directory-browser.ts
- ComputerSummary
- transcription-service.ts
- compilerOptions
- app.ts
- delegated-transcription-service.ts
- tmux-errors.integration.test.ts
- active-sessions.ts
- capture-workspace.ts
- session-clear-transcript.test.ts
- knowledge-tree.ts
- compilerOptions
- recordValue
- session-store-providers.test.ts
- NewSessionDialog
- compilerOptions
- compilerOptions
- event-log.ts
- workspace-browser.ts
- session-resource-routes.test.ts
- ReaderWorkspace
- workspace-fixtures.ts
- agent-service.test.ts
- recovery-resend-durability.test.ts
- session-reply-durability.test.ts
- check-workspace-review-regressions.ts
- capture
- desktop.json
- queued-dispatch.test.ts
- capture-workbench-review.ts
- package.json
- settings-local.json
- CopilotSessionLike
- TranscriptionError
- .replyUserInput
- promotion-monitor.test.ts
- scripts
- push-notification-service.ts
- composerHoldsText
- use-session-knowledge-root.ts
- .oxlintrc.json
- session-store-durability.test.ts
- DeferredSession
- session-enqueue-clear.test.ts
- bridge.rs
- setupWorkspaceFixture
- screenshot-stability.test.ts
- KnowledgePosition
- SessionFileUpload
- UserInputFieldControl
- DocumentViewControls.tsx
- settings.ts
- composer-layout.test.ts
- release-publication.test.ts
- MarkdownCodeBlock.tsx
- .discoverTerminalSessions
- terminal-send-uncertainty.test.ts
- MockMediaRecorder
- MockWebSocket
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
- agentic-remote-shell

## God Nodes (most connected - your core abstractions)
1. `SessionDetail` - 253 edges
2. `App()` - 217 edges
3. `AgentService` - 194 edges
4. `SessionStore` - 134 edges
5. `ClaudeAgentService` - 113 edges
6. `ComputerManager` - 78 edges
7. `SessionService` - 67 edges
8. `RemoteNodeClient` - 64 edges
9. `registerHubRoutes()` - 57 edges
10. `ProviderSessionService` - 53 edges

## Surprising Connections (you probably didn't know these)
- `submit()` --indirect_call--> `provider()`  [INFERRED]
  src/App.tsx → server/provider-session-service.test.ts
- `composerKeyDown()` --indirect_call--> `composer()`  [INFERRED]
  src/App.tsx → server/terminal-send-uncertainty.test.ts
- `AcceptedSdkReply` --references--> `SessionDetail`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `BackgroundTaskUpdate` --references--> `BackgroundTaskSnapshot`  [EXTRACTED]
  server/background-task-tracker.ts → shared/contracts.ts
- `PendingClaudeReply` --references--> `SessionDetail`  [EXTRACTED]
  server/claude-agent-service.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (127 total, 20 thin omitted)

### Community 0 - "App"
Cohesion: 0.03
Nodes (146): submissionReceiptFromError(), replyPermission(), activeComposerPastes(), App(), answerUserInput(), appendComposerForKey(), appKeyDown(), applyComputerSnapshot() (+138 more)

### Community 1 - "AgentService"
Cohesion: 0.05
Nodes (9): agentMode(), AgentService, isForegroundCompletionEvent(), isForegroundLifecycleEvent(), removeCopilotSessionFiles(), RuntimeConfigurationError, statusFromEvents(), fixture() (+1 more)

### Community 2 - "App.tsx"
Cohesion: 0.03
Nodes (97): accentIconUrl(), applyAccentIcon(), addComputer(), configureRuntime(), removeComputer(), AccentTheme, accentThemes, activityKindFromMessage() (+89 more)

### Community 3 - "api.ts"
Cohesion: 0.04
Nodes (104): ManagedSessionMcpServersSnapshot, ManagedSessionSkillsSnapshot, parseSubmissionReceipt(), addKnowledgeRoot(), cancelBackgroundTask(), cancelSession(), clearConversation(), deleteKnowledgeRoot() (+96 more)

### Community 4 - "SessionDetail"
Cohesion: 0.05
Nodes (9): ClaudeAgentService, isMissingClaudeSessionError(), preparePrompt(), queueConflict(), observe(), QueuedPromptReservation, QueuedPrompt, RuntimeModelOption (+1 more)

### Community 5 - "SessionStore"
Cohesion: 0.06
Nodes (40): fixture(), connect(), createStore(), deferred(), disk, enqueue(), fixture(), fixtures (+32 more)

### Community 6 - "background-task-adapter.ts"
Cohesion: 0.06
Nodes (72): addActivity(), attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), boundedText(), CopilotTaskInfo (+64 more)

### Community 7 - "BackgroundTaskSnapshot"
Cohesion: 0.05
Nodes (57): plugins, oxc, react, typescript, BackgroundTaskSnapshot, SessionMcpServerSummary, SessionResourceSource, SessionSkillSummary (+49 more)

### Community 8 - "SessionKnowledgeStore"
Cohesion: 0.06
Nodes (38): Lineage, registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession() (+30 more)

### Community 9 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (67): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+59 more)

### Community 10 - ".sendAdmittedWithBackend"
Cohesion: 0.07
Nodes (15): isUncertainDelivery(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight(), QueuedDelivery, QueuedDispatches (+7 more)

### Community 11 - "claude-agent-service.ts"
Cohesion: 0.11
Nodes (45): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission (+37 more)

### Community 12 - "session-store.ts"
Cohesion: 0.04
Nodes (37): holdProbe(), fixtures, gate(), releases, ClaudeSdk, directories, fixture(), queryHandle() (+29 more)

### Community 13 - "agent-service.ts"
Cohesion: 0.05
Nodes (45): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), ActivityToolStart, ansiSequence, commandShortcut(), DeliveryBoundary (+37 more)

### Community 14 - "SessionService"
Cohesion: 0.08
Nodes (5): registerNodeRoutes(), readServiceResources(), readSessionMcpServers(), readSessionSkills(), SessionService

### Community 15 - "terminal-session.test.ts"
Cohesion: 0.08
Nodes (37): findActiveCopilotSessions(), directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), directories, exec (+29 more)

### Community 16 - "terminal-session.ts"
Cohesion: 0.13
Nodes (41): activeBottomFrame(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), COMPOSER_PLACEHOLDERS, containsCopiedInteractiveFrame(), desktopInstallPromptIdentity(), findTerminalWrappedText() (+33 more)

### Community 17 - "TmuxTerminalSessionController"
Cohesion: 0.11
Nodes (13): copilotCommand(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand(), processIsAlive(), safeWindowName(), submitTerminalForm() (+5 more)

### Community 18 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 19 - "ComputerManager"
Cohesion: 0.19
Nodes (6): ComputerManager, managedSession(), registerHubRoutes(), ManagedRemovedQueuedPrompt, ManagedSession, SessionListing

### Community 20 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 21 - "multi-node.test.ts"
Cohesion: 0.08
Nodes (13): CreationRuntime, directories, provider(), AgentProvider, ConfigureRuntimeInput, ProviderRuntimeOptions, QueuedPromptDispatchResult, RuntimeOptions (+5 more)

### Community 22 - "contracts.ts"
Cohesion: 0.06
Nodes (33): ComputerManagerEvents, RemoteResync, RemoteSessionListing, RemoteSessionRead, sameResourceOwner(), ActivityStatus, AddComputerInput, AddKnowledgeRootInput (+25 more)

### Community 23 - "RemoteNodeClient"
Cohesion: 0.08
Nodes (5): headerSafe(), RemoteNodeClient, RemovedQueuedPrompt, WorkspaceFile, WorkspaceListing

### Community 24 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 25 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 26 - "session-knowledge-routes.test.ts"
Cohesion: 0.08
Nodes (20): WorkspaceFixtureState, ServerRole, SessionMetadataLookup, KnowledgeState, KnowledgeStore, directories, disk, FakeManager (+12 more)

### Community 28 - "FakeSessionService"
Cohesion: 0.08
Nodes (4): FakeSessionService, routingFixture(), session(), temporaryDirectory()

### Community 29 - "pwa.ts"
Cohesion: 0.11
Nodes (32): getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate(), testNotification(), toggle() (+24 more)

### Community 30 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 31 - "dependencies"
Cohesion: 0.06
Nodes (33): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/static, @fastify/websocket, ffmpeg-static (+25 more)

### Community 32 - "agentic-remote"
Cohesion: 0.14
Nodes (30): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+22 more)

### Community 34 - "WorkspaceDialog"
Cohesion: 0.13
Nodes (29): followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), MarkdownImage(), missingDocumentFragment(), WorkspaceDialog(), moveHere(), navigateDocument() (+21 more)

### Community 35 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (28): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+20 more)

### Community 36 - "computer-manager-metadata.test.ts"
Cohesion: 0.11
Nodes (12): fixture(), managers, releases, remote, session(), ComputerRegistry, RegistryState, directories (+4 more)

### Community 37 - "node-routes.ts"
Cohesion: 0.08
Nodes (25): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile(), configureRuntimeSchema, createSessionSchema (+17 more)

### Community 38 - "hub-routes.ts"
Cohesion: 0.07
Nodes (27): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+19 more)

### Community 39 - "remote-node-client.ts"
Cohesion: 0.10
Nodes (19): AgentServiceEvents, ClaudeAgentServiceEvents, AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, ProviderSessionServiceEvents, DEFINITE_DISPATCH_REFUSALS, normalizeNodeUrl(), REDIRECT_STATUSES (+11 more)

### Community 40 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 41 - "PushNotificationService"
Cohesion: 0.19
Nodes (3): HubEventSource, PushNotificationService, registerPushRoutes()

### Community 42 - "directory-browser.ts"
Cohesion: 0.17
Nodes (13): DirectoryScope, displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin() (+5 more)

### Community 43 - "ComputerSummary"
Cohesion: 0.15
Nodes (3): sessionAtLeastAsNew(), RegisteredComputer, ComputerSummary

### Community 44 - "transcription-service.ts"
Cohesion: 0.10
Nodes (20): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+12 more)

### Community 45 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 46 - "app.ts"
Cohesion: 0.14
Nodes (14): prefixes, session, trusted, untrusted, directories, buildApp(), errorStatusCode(), transcriptionComputerName() (+6 more)

### Community 47 - "delegated-transcription-service.ts"
Cohesion: 0.13
Nodes (12): BuildAppOptions, collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation (+4 more)

### Community 48 - "tmux-errors.integration.test.ts"
Cohesion: 0.12
Nodes (19): execFileAsync, headers, ignoreMissing(), removeFixture(), seedSession(), sessionLog(), stopOwnedServer(), noTmuxServer() (+11 more)

### Community 49 - "active-sessions.ts"
Cohesion: 0.20
Nodes (22): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates(), isCopilotProcess() (+14 more)

### Community 50 - "capture-workspace.ts"
Cohesion: 0.20
Nodes (20): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+12 more)

### Community 51 - "session-clear-transcript.test.ts"
Cohesion: 0.11
Nodes (9): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions, disk, fixtures, gate(), holdTurnWrite() (+1 more)

### Community 52 - "knowledge-tree.ts"
Cohesion: 0.17
Nodes (18): WorkspaceEntry, knowledgeTreeKeyDown(), toggleKnowledgeFolder(), collapseKnowledgeFolder(), expandKnowledgeFolder(), knowledgeAncestors(), KnowledgeCrumb, knowledgeCrumbs() (+10 more)

### Community 53 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 54 - "recordValue"
Cohesion: 0.25
Nodes (17): activityKind(), activityResult(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), isBackgroundTaskEvent(), isUnsupportedBackgroundTaskError() (+9 more)

### Community 55 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (9): claude(), clearFixture(), copilot(), disk, event(), fixtures, holdOtherWrite(), releases (+1 more)

### Community 56 - "NewSessionDialog"
Cohesion: 0.16
Nodes (20): activateSession(), createSession(), executeCommand(), listDirectories(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), moveSessionToBrowsedFolder() (+12 more)

### Community 57 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 58 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 59 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 60 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 61 - "session-resource-routes.test.ts"
Cohesion: 0.14
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, ResourceService, transcription, AgentProviderCapability

### Community 62 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 63 - "workspace-fixtures.ts"
Cohesion: 0.16
Nodes (14): documents, FIXTURE_NOW, fixtureBackgroundTasks, fixtureComputers, fixtureEndpoints, fixtureKnowledgeListings, fixtureKnowledgePositions, fixtureKnowledgeRoots (+6 more)

### Community 64 - "agent-service.test.ts"
Cohesion: 0.15
Nodes (7): terminalFormSteps(), configurableModel(), directories, FakeCopilotClient, services, startupFifoFixture(), UserInputForm

### Community 65 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 66 - "session-reply-durability.test.ts"
Cohesion: 0.20
Nodes (12): assistantFixture(), claudeFixture(), claudeQuestions(), claudeRunFixture(), copilotFixture(), copilotRunFixture(), disk, fixtures (+4 more)

### Community 67 - "check-workspace-review-regressions.ts"
Cohesion: 0.14
Nodes (12): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+4 more)

### Community 68 - "capture"
Cohesion: 0.20
Nodes (14): releaseRecording(), shortcutKeys(), stopRecording(), binding(), bindingLabel(), capturableCode(), isModifierCode(), keyLabel() (+6 more)

### Community 69 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 70 - "queued-dispatch.test.ts"
Cohesion: 0.15
Nodes (7): deferred(), disk, fixtures, holdWrite(), prompt(), releases, target

### Community 71 - "capture-workbench-review.ts"
Cohesion: 0.17
Nodes (10): frame(), geometry, output, scratch, screenshot(), { values }, fixtureSessions, IDLE_SESSION_ID (+2 more)

### Community 72 - "package.json"
Cohesion: 0.15
Nodes (11): directory, { values }, workflows, name, packageManager, pnpm, onlyBuiltDependencies, private (+3 more)

### Community 73 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 74 - "CopilotSessionLike"
Cohesion: 0.24
Nodes (6): CopilotSessionLike, CopilotTasksApi, acceptanceReceipt(), queuedSdkPrompt(), disposals, fixture()

### Community 75 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 77 - ".replyUserInput"
Cohesion: 0.24
Nodes (4): answer(), claudeRequest(), copilotRequest(), PendingUserInput

### Community 78 - "promotion-monitor.test.ts"
Cohesion: 0.30
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 79 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, check, dev, dev:server, dev:web, lint, start (+3 more)

### Community 80 - "push-notification-service.ts"
Cohesion: 0.18
Nodes (8): brief(), PushSender, PushState, directories, sessionMuteSchema, subscriptionSchema, testNotificationSchema, unsubscribeSchema

### Community 81 - "composerHoldsText"
Cohesion: 0.33
Nodes (11): composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), occurrences(), paneEvidenceCount(), paneShowsText(), pasteCouldCollapse() (+3 more)

### Community 82 - "use-session-knowledge-root.ts"
Cohesion: 0.24
Nodes (7): bindingKey(), knowledgePositionForBinding(), SessionIdentity, first, root, second, useSessionKnowledgeRoot()

### Community 83 - ".oxlintrc.json"
Cohesion: 0.20
Nodes (9): ignorePatterns, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/**, graphify/.venv/** (+1 more)

### Community 84 - "session-store-durability.test.ts"
Cohesion: 0.27
Nodes (7): disk, fixture(), fixtures, prompt(), ready(), releases, session()

### Community 86 - "session-enqueue-clear.test.ts"
Cohesion: 0.29
Nodes (9): disk, EnqueueCase, fixtures, gate(), holdEnqueue(), joinedEnqueue(), quiet(), releases (+1 more)

### Community 87 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 88 - "setupWorkspaceFixture"
Cohesion: 0.25
Nodes (6): pageFor(), createWorkspaceFixtureState(), fixtureBaseUrl(), fixtureValue(), setupWorkspaceFixture(), fixtureApi()

### Community 89 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 90 - "KnowledgePosition"
Cohesion: 0.33
Nodes (5): WorkspaceFixtureOptions, KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 92 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 93 - "DocumentViewControls.tsx"
Cohesion: 0.29
Nodes (4): DocumentViewControls(), actions, outline, DocumentHeading

### Community 94 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 95 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 96 - "release-publication.test.ts"
Cohesion: 0.40
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 97 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

## Knowledge Gaps
- **592 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+587 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 898 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **20 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `.get`, `.discoverTerminalSessions`, `SessionDetail`, `SessionStore`, `.sendAdmittedWithBackend`, `directory-browser.ts`, `.claimFailure`, `claude-agent-service.ts`, `recordValue`, `SessionFileUpload`, `session-resource-routes.test.ts`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **Why does `ClaudeAgentService` connect `SessionDetail` to `.get`, `SessionStore`, `directory-browser.ts`, `claude-agent-service.ts`, `.sendAdmittedWithBackend`, `.replyUserInput`, `SessionService`, `multi-node.test.ts`, `SessionFileUpload`, `session-resource-routes.test.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionStore` to `AgentService`, `.get`, `SessionDetail`, `.sendAdmittedWithBackend`, `session-store.ts`, `.claimFailure`, `SessionFileUpload`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _592 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.032851167654234924 - nodes in this community are weakly interconnected._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.046027131782945735 - nodes in this community are weakly interconnected._
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
