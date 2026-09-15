# Agentic Remote - Graphify code map

Snapshot: `0ae80e2b3c85c0586c5c814c65689dd020ffc35376da341e5d3f46ca98968024`

Source checkout: `99997e123a188b0b6b8226209f8e9995d0b1dbf5`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 227 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 227 files · ~459,335 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3461 nodes · 9750 edges · 148 communities (112 shown, 21 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 722 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App
- api.ts
- App.tsx
- contracts.ts
- ClaudeAgentService
- agent-service.ts
- SessionDetail
- AgentService
- agentic-remote-promotion-monitor
- markdown-navigation.ts
- terminal-session.ts
- ComputerManager
- RemoteNodeClient
- BackgroundTaskSnapshot
- terminal-session.test.ts
- SessionService
- TmuxTerminalSessionController
- queueConflict
- pwa.ts
- bundle
- session-knowledge-routes.test.ts
- lib.rs
- shell.ts
- ProviderSessionService
- config.rs
- .get
- .sendAdmittedWithBackend
- .create
- CopilotSessionLike
- hub-routes.ts
- devDependencies
- FakeSessionService
- dependencies
- agentic-remote
- background-task-adapter.ts
- session-resources.ts
- tmux-errors.integration.test.ts
- agentic-remote-promotion-setup
- app.ts
- session-admission-lifecycle.test.ts
- session-reply-durability.test.ts
- computer-manager-metadata.test.ts
- delegated-transcription-service.ts
- terminal-startup-queue.test.ts
- scripts
- PushNotificationService
- compilerOptions
- session-resource-clear.test.ts
- session-store.ts
- SessionOrderStore
- transcription-service.ts
- node-routes.ts
- NewSessionDialog
- SessionKnowledgeStore
- SessionMcpServersSnapshot
- session-store-providers.test.ts
- noTmuxServer
- capture-workspace.ts
- claude-agent-service.ts
- session-knowledge-store.ts
- knowledge-tree.ts
- compilerOptions
- compilerOptions
- check-workspace-review-regressions.ts
- compilerOptions
- session-resource-routes.test.ts
- recordValue
- workspace-browser.ts
- normalizeKnowledgeRelativePath
- use-session-knowledge-root.ts
- directory-browser.ts
- ReaderWorkspace
- background-task-stop.test.ts
- queued-provider-dispatch.test.ts
- recovery-resend-durability.test.ts
- capture
- .sendSdkFollowUp
- workspace-fixtures.ts
- react
- desktop.json
- submission-error.ts
- registerSessionKnowledgeRoutes
- session-resource-providers.test.ts
- BackgroundTasksDialog.tsx
- capture-workbench-review.ts
- package.json
- settings-local.json
- DeferredSession
- push-notification-service.ts
- TranscriptionError
- session-response-order.ts
- scripts
- background-task-tracker.ts
- promotion-monitor.test.ts
- recovery-seed-guards.test.ts
- html-preview.ts
- ResourceReads
- session-knowledge-routes.ts
- session-knowledge-store.test.ts
- .oxlintrc.json
- generate-pwa-icons.ts
- SessionFileUpload
- bridge.rs
- setupWorkspaceFixture
- screenshot-stability.test.ts
- KnowledgePosition
- claude-agent-service.test.ts
- remote-node-client.test.ts
- session-resource-transport.ts
- .providerRuntimeOptions
- recovery-context.ts
- settings.ts
- composer-layout.test.ts
- release-publication.test.ts
- session-navigation-view.test.ts
- removeComputer
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
2. `App()` - 241 edges
3. `AgentService` - 217 edges
4. `SessionStore` - 150 edges
5. `ClaudeAgentService` - 118 edges
6. `ComputerManager` - 80 edges
7. `registerHubRoutes()` - 74 edges
8. `SessionService` - 70 edges
9. `RemoteNodeClient` - 65 edges
10. `TmuxTerminalSessionController` - 56 edges

## Surprising Connections (you probably didn't know these)
- `composerKeyDown()` --indirect_call--> `composer()`  [INFERRED]
  src/App.tsx → server/terminal-send-uncertainty.test.ts
- `AcceptedSdkReply` --references--> `SessionDetail`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `BackgroundTaskUpdate` --references--> `BackgroundTaskSnapshot`  [EXTRACTED]
  server/background-task-tracker.ts → shared/contracts.ts
- `PendingClaudeReply` --references--> `SessionDetail`  [EXTRACTED]
  server/claude-agent-service.ts → shared/contracts.ts
- `RemoteSessionListing` --references--> `ManagedSession`  [EXTRACTED]
  server/computer-manager.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (148 total, 21 thin omitted)

### Community 0 - "App"
Cohesion: 0.03
Nodes (147): listKnowledgeEntries(), readKnowledgeFile(), replyPermission(), resumeSession(), saveSessionOrderLane(), suspendSession(), activeComposerPastes(), App() (+139 more)

### Community 1 - "api.ts"
Cohesion: 0.04
Nodes (98): ManagedSessionMcpServersSnapshot, ManagedSessionSkillsSnapshot, SessionMcpServerSummary, SessionSkillSummary, addKnowledgeRoot(), bootstrapSessionOrder(), cancelBackgroundTask(), cancelSession() (+90 more)

### Community 2 - "App.tsx"
Cohesion: 0.03
Nodes (89): configureRuntime(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph() (+81 more)

### Community 3 - "contracts.ts"
Cohesion: 0.04
Nodes (55): AgentServiceEvents, CreationRuntime, ClaudeAgentServiceEvents, RemoteResync, RemoteSessionListing, RemoteSessionRead, DirectoryScope, directories (+47 more)

### Community 4 - "ClaudeAgentService"
Cohesion: 0.06
Nodes (6): ClaudeAgentService, isMissingClaudeSessionError(), claudeFixture(), QueuedPromptReservation, QueuedPromptDispatchResult, RuntimeModelOption

### Community 5 - "agent-service.ts"
Cohesion: 0.05
Nodes (66): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, ansiSequence (+58 more)

### Community 6 - "SessionDetail"
Cohesion: 0.07
Nodes (11): observe(), clearRecoverySeedFailure(), cloneSession(), ownsRecoverySeedFailure(), SessionStore, StoredSession, acceptedStartupRecovery(), ChatMessage (+3 more)

### Community 7 - "AgentService"
Cohesion: 0.07
Nodes (7): AgentService, persistedFormAnswer(), TerminalFormContinuation, fixture(), httpBoundary(), TerminalFormReplyError, UserInputReplyInput

### Community 8 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (67): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+59 more)

### Community 9 - "markdown-navigation.ts"
Cohesion: 0.06
Nodes (55): UserInputField, UserInputFieldValue, searchWorkspace(), followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), MarkdownImage(), missingDocumentFragment() (+47 more)

### Community 10 - "terminal-session.ts"
Cohesion: 0.09
Nodes (58): activeBottomFrame(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), COMPOSER_PLACEHOLDERS, composerHoldsOtherText(), composerHoldsText(), composerText() (+50 more)

### Community 11 - "ComputerManager"
Cohesion: 0.15
Nodes (7): ComputerManager, managedSession(), sessionAtLeastAsNew(), registerHubRoutes(), ComputerSummary, ManagedRemovedQueuedPrompt, ManagedSession

### Community 12 - "RemoteNodeClient"
Cohesion: 0.06
Nodes (8): RegisteredComputer, headerSafe(), RemoteNodeClient, NodeInfo, RemovedQueuedPrompt, WorkspaceFile, WorkspaceListing, WorkspaceFileIcon()

### Community 13 - "BackgroundTaskSnapshot"
Cohesion: 0.08
Nodes (41): hasRunningBackgroundAgent(), BackgroundTaskSnapshot, KnowledgeRootSelector(), root, SessionFilter, sessionNavigationView, attentionRank, computerTone() (+33 more)

### Community 14 - "terminal-session.test.ts"
Cohesion: 0.08
Nodes (41): directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), exec, formFixture(), horizontalFormFixture() (+33 more)

### Community 16 - "SessionService"
Cohesion: 0.08
Nodes (5): registerNodeRoutes(), readServiceResources(), readSessionMcpServers(), readSessionSkills(), SessionService

### Community 17 - "TmuxTerminalSessionController"
Cohesion: 0.12
Nodes (13): copilotCommand(), execFileAsync, formViewportTimeout(), listTmuxSessions(), processAncestors(), processCommand(), processIsAlive(), safeWindowName() (+5 more)

### Community 18 - "queueConflict"
Cohesion: 0.09
Nodes (24): acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight(), preparePrompt(), queueConflict() (+16 more)

### Community 19 - "pwa.ts"
Cohesion: 0.09
Nodes (39): directories, AppVersion, parseAppVersion(), deletePushSubscription(), getProviderRuntimeOptions(), getPushPublicKey(), savePushSubscription(), sendTestPushNotification() (+31 more)

### Community 20 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 21 - "session-knowledge-routes.test.ts"
Cohesion: 0.07
Nodes (20): WorkspaceFixtureState, ServerRole, SessionMetadataLookup, SessionMuteCarrier, KnowledgeState, KnowledgeStore, directories, disk (+12 more)

### Community 22 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 23 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 25 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 26 - ".get"
Cohesion: 0.12
Nodes (3): agentMode(), isMissingSessionError(), removeCopilotSessionFiles()

### Community 27 - ".sendAdmittedWithBackend"
Cohesion: 0.09
Nodes (5): commandShortcut(), stripAnsi(), TerminalSendOptions, TerminalSessionController, PendingUserInput

### Community 28 - ".create"
Cohesion: 0.09
Nodes (24): fixture(), holdProbe(), fixtures, gate(), releases, connect(), createStore(), deferred() (+16 more)

### Community 29 - "CopilotSessionLike"
Cohesion: 0.07
Nodes (17): CopilotClientLike, CopilotSessionLike, terminalFormSteps(), configurableModel(), directories, FakeCopilotClient, services, startupFifoFixture() (+9 more)

### Community 30 - "hub-routes.ts"
Cohesion: 0.06
Nodes (35): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+27 more)

### Community 31 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 33 - "dependencies"
Cohesion: 0.06
Nodes (33): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, @fastify/multipart, @fastify/static, @fastify/websocket, ffmpeg-static (+25 more)

### Community 34 - "agentic-remote"
Cohesion: 0.14
Nodes (30): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+22 more)

### Community 35 - "background-task-adapter.ts"
Cohesion: 0.16
Nodes (31): addActivity(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), boundedText(), errorValue(), eventTask(), executionModeValue(), isLiveTaskStatus() (+23 more)

### Community 36 - "session-resources.ts"
Cohesion: 0.19
Nodes (29): claudeMcp(), claudeSkillNames(), copilotMcp, copilotSkills, copilotWorkspaceMcp, CopilotWorkspaceSkills, count(), enrichClaudeSkills() (+21 more)

### Community 37 - "tmux-errors.integration.test.ts"
Cohesion: 0.13
Nodes (30): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+22 more)

### Community 38 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (28): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+20 more)

### Community 39 - "app.ts"
Cohesion: 0.11
Nodes (19): prefixes, session, trusted, untrusted, buildApp(), errorStatusCode(), isAppleTouchIconProbe(), transcriptionComputerName() (+11 more)

### Community 40 - "session-admission-lifecycle.test.ts"
Cohesion: 0.08
Nodes (19): deferred(), disk, enqueue(), fixture(), fixtures, holdAdmissionWrite(), releases, disk (+11 more)

### Community 41 - "session-reply-durability.test.ts"
Cohesion: 0.13
Nodes (18): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRequest() (+10 more)

### Community 42 - "computer-manager-metadata.test.ts"
Cohesion: 0.11
Nodes (11): fixture(), managers, releases, remote, session(), ComputerRegistry, RegistryState, directories (+3 more)

### Community 43 - "delegated-transcription-service.ts"
Cohesion: 0.12
Nodes (13): BuildAppOptions, collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation (+5 more)

### Community 44 - "terminal-startup-queue.test.ts"
Cohesion: 0.13
Nodes (23): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+15 more)

### Community 45 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 46 - "PushNotificationService"
Cohesion: 0.19
Nodes (3): HubEventSource, PushNotificationService, registerPushRoutes()

### Community 47 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 48 - "session-resource-clear.test.ts"
Cohesion: 0.11
Nodes (22): ClaudeSdk, disk, EnqueueCase, fixtures, gate(), holdEnqueue(), joinedEnqueue(), quiet() (+14 more)

### Community 49 - "session-store.ts"
Cohesion: 0.09
Nodes (18): channels, directories, activityDuration(), activityResultPreview(), archivedMessage(), emptyRetirements, PendingChange, RecoveryResend (+10 more)

### Community 50 - "SessionOrderStore"
Cohesion: 0.20
Nodes (9): orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState, SessionOrderStore, directories, store() (+1 more)

### Community 51 - "transcription-service.ts"
Cohesion: 0.11
Nodes (19): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+11 more)

### Community 52 - "node-routes.ts"
Cohesion: 0.09
Nodes (22): AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema (+14 more)

### Community 53 - "NewSessionDialog"
Cohesion: 0.14
Nodes (23): provider(), activateSession(), createSession(), executeCommand(), listDirectories(), listHistory(), listWorkspace(), validateSessionDirectory() (+15 more)

### Community 54 - "SessionKnowledgeStore"
Cohesion: 0.21
Nodes (4): bindingKey(), SessionKnowledgeStore, stateWithPaths(), SessionKnowledgeBinding

### Community 55 - "SessionMcpServersSnapshot"
Cohesion: 0.16
Nodes (9): ClaudeResources, isResourceMethodUnavailable(), mcpSnapshot(), safeResourceError(), unavailableMcp(), unavailableSkills(), SessionMcpServersSnapshot, SessionResourceSnapshot (+1 more)

### Community 56 - "session-store-providers.test.ts"
Cohesion: 0.11
Nodes (10): claude(), clearFixture(), copilot(), disk, event(), fixtures, holdOtherWrite(), releases (+2 more)

### Community 57 - "noTmuxServer"
Cohesion: 0.12
Nodes (14): noTmuxServer(), processGone(), procVisible(), socketIdentity(), directories, { execute }, files, links (+6 more)

### Community 58 - "capture-workspace.ts"
Cohesion: 0.20
Nodes (20): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+12 more)

### Community 59 - "claude-agent-service.ts"
Cohesion: 0.11
Nodes (12): AuthStatusRunner, ClaudeQuestion, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission, PendingClaudeReply, toolResultText() (+4 more)

### Community 60 - "session-knowledge-store.ts"
Cohesion: 0.10
Nodes (19): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+11 more)

### Community 61 - "knowledge-tree.ts"
Cohesion: 0.17
Nodes (18): WorkspaceEntry, knowledgeTreeKeyDown(), toggleKnowledgeFolder(), collapseKnowledgeFolder(), expandKnowledgeFolder(), knowledgeAncestors(), KnowledgeCrumb, knowledgeCrumbs() (+10 more)

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

### Community 66 - "session-resource-routes.test.ts"
Cohesion: 0.13
Nodes (9): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription (+1 more)

### Community 67 - "recordValue"
Cohesion: 0.18
Nodes (19): attachmentModeValue(), backgroundHandoff(), booleanValue(), eventString(), lastForegroundCompletionAt(), normalizedToolName(), notificationKind(), parsedValue() (+11 more)

### Community 68 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 69 - "normalizeKnowledgeRelativePath"
Cohesion: 0.22
Nodes (15): joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath(), slashPath(), scopedKnowledgeRoot(), KnowledgeRootChoice (+7 more)

### Community 70 - "use-session-knowledge-root.ts"
Cohesion: 0.19
Nodes (12): getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey(), knowledgePositionForBinding(), SessionIdentity (+4 more)

### Community 71 - "directory-browser.ts"
Cohesion: 0.28
Nodes (11): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin(), SessionDirectoryError (+3 more)

### Community 72 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 73 - "background-task-stop.test.ts"
Cohesion: 0.21
Nodes (13): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), snapshot() (+5 more)

### Community 74 - "queued-provider-dispatch.test.ts"
Cohesion: 0.16
Nodes (9): claudeFixture(), copilotFixture(), copilotSession(), fixtures, gate(), originalQueue, pause(), releases (+1 more)

### Community 75 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 76 - "capture"
Cohesion: 0.18
Nodes (15): releaseRecording(), shortcutKeys(), startRecording(), stopRecording(), binding(), bindingLabel(), capturableCode(), isModifierCode() (+7 more)

### Community 78 - "workspace-fixtures.ts"
Cohesion: 0.15
Nodes (13): BACKGROUND_SESSION_ID, documents, FIXTURE_NOW, fixtureBackgroundTasks, fixtureEndpoints, fixtureKnowledgeListings, fixtureKnowledgePositions, fixtureModels (+5 more)

### Community 79 - "react"
Cohesion: 0.16
Nodes (8): plugins, oxc, react, typescript, MarkdownCodeBlock(), copy(), originalClipboard, SessionActions()

### Community 80 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 81 - "submission-error.ts"
Cohesion: 0.25
Nodes (9): RemoteNodeRedirectError, RemoteNodeRequestError, httpDeliveryUncertain(), legacyDefinitiveHttpRefusals, parseSubmissionReceipt(), SubmissionError, SubmissionReceipt, submissionReceiptFromError() (+1 more)

### Community 82 - "registerSessionKnowledgeRoutes"
Cohesion: 0.30
Nodes (11): registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession(), recordReplacement() (+3 more)

### Community 83 - "session-resource-providers.test.ts"
Cohesion: 0.18
Nodes (13): ClaudeMcpRead, copilotFixture(), deferred(), directory(), DiscoveredMcp, DiscoveredSkills, fixtures, Mcp (+5 more)

### Community 84 - "BackgroundTasksDialog.tsx"
Cohesion: 0.23
Nodes (10): DialogFrame(), BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive() (+2 more)

### Community 85 - "capture-workbench-review.ts"
Cohesion: 0.17
Nodes (10): frame(), geometry, output, scratch, screenshot(), { values }, fixtureSessions, IDLE_SESSION_ID (+2 more)

### Community 86 - "package.json"
Cohesion: 0.15
Nodes (11): directory, { values }, workflows, name, packageManager, pnpm, onlyBuiltDependencies, private (+3 more)

### Community 87 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 88 - "DeferredSession"
Cohesion: 0.17
Nodes (4): DeferredSession, CopilotTaskInfo, CopilotTaskProgress, BackgroundTaskKind

### Community 89 - "push-notification-service.ts"
Cohesion: 0.15
Nodes (10): brief(), PushSender, PushState, directories, RFC-8030, RFC-8030, sessionMuteSchema, subscriptionSchema (+2 more)

### Community 90 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 91 - "session-response-order.ts"
Cohesion: 0.27
Nodes (11): sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), currentSessionEventSequence(), nextSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences (+3 more)

### Community 92 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+4 more)

### Community 93 - "background-task-tracker.ts"
Cohesion: 0.30
Nodes (6): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 94 - "promotion-monitor.test.ts"
Cohesion: 0.30
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 95 - "recovery-seed-guards.test.ts"
Cohesion: 0.18
Nodes (8): bootLegacy(), directories, execute, pending, releases, SeedState, services, stores

### Community 96 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 97 - "ResourceReads"
Cohesion: 0.22
Nodes (6): ActiveClaudeQuery, releases, session, snapshot, ResourceReads, resourceRequestHandler()

### Community 98 - "session-knowledge-routes.ts"
Cohesion: 0.18
Nodes (6): Lineage, RegistrationGeneration, ReplacementEvidence, SessionKnowledgeLifecycle, sessionParams, updateSchema

### Community 99 - "session-knowledge-store.test.ts"
Cohesion: 0.20
Nodes (7): SessionKnowledgeConflictError, SessionKnowledgeRecoveryError, disk, fixture(), fixtures, releases, root()

### Community 100 - ".oxlintrc.json"
Cohesion: 0.20
Nodes (9): ignorePatterns, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/**, graphify/.venv/** (+1 more)

### Community 101 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

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

### Community 107 - "claude-agent-service.test.ts"
Cohesion: 0.25
Nodes (6): cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle()

### Community 108 - "remote-node-client.test.ts"
Cohesion: 0.28
Nodes (5): client(), servers, session, TERMINAL_REQUEST_TIMEOUT_MS, TERMINAL_STARTUP_TIMEOUT_MS

### Community 109 - "session-resource-transport.ts"
Cohesion: 0.36
Nodes (7): readClaudeMcp(), readCopilotResource(), copilotTransport(), disposals, Frame, write(), unavailable()

### Community 111 - "recovery-context.ts"
Cohesion: 0.38
Nodes (4): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief

### Community 112 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 113 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 114 - "release-publication.test.ts"
Cohesion: 0.40
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 115 - "session-navigation-view.test.ts"
Cohesion: 0.33
Nodes (5): computers, first, grouped, hidden, last

### Community 116 - "removeComputer"
Cohesion: 0.60
Nodes (5): addComputer(), removeComputer(), ComputersDialog(), remove(), submit()

### Community 120 - "MermaidDiagram.tsx"
Cohesion: 0.67
Nodes (3): drawDiagram(), drawing, MermaidDiagram()

## Knowledge Gaps
- **660 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+655 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 992 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `fixture()` connect `.create` to `session-resource-clear.test.ts`, `ClaudeAgentService`, `SessionDetail`, `AgentService`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `AgentService` connect `AgentService` to `session-resource-routes.test.ts`, `contracts.ts`, `agent-service.ts`, `SessionFileUpload`, `.sendSdkFollowUp`, `.providerRuntimeOptions`, `.readAfterWrites`, `queueConflict`, `SessionMcpServersSnapshot`, `.get`, `.sendAdmittedWithBackend`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionDetail` to `agent-service.ts`, `SessionFileUpload`, `AgentService`, `.readAfterWrites`, `session-store.ts`, `SessionMcpServersSnapshot`, `session-store-providers.test.ts`, `.get`, `.create`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _660 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.0333472978634269 - nodes in this community are weakly interconnected._
- **Should `api.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.03824273072060683 - nodes in this community are weakly interconnected._
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
