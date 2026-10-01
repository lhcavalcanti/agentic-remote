# Agentic Remote - Graphify code map

Snapshot: `df00015999ba013ff5e150d00c60300f3f591eee7ef8af6855aee4d3335a810e`

Source checkout: `bc7b910c9926122b109512cb6b84c42f6683b5c2`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 230 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 230 files · ~470,961 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3507 nodes · 9900 edges · 147 communities (109 shown, 23 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 728 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App
- SessionStore
- AgentService
- api.ts
- App.tsx
- contracts.ts
- queueConflict
- background-task-adapter.ts
- ComputerManager
- ClaudeAgentService
- agentic-remote-promotion-monitor
- markdown-navigation.ts
- agent-service.ts
- .get
- terminal-session.test.ts
- terminal-session.ts
- TmuxTerminalSessionController
- SessionDetail
- RemoteNodeClient
- pwa.ts
- bundle
- SessionService
- lib.rs
- ProviderSessionService
- config.rs
- hub-routes.ts
- knowledge-tree.ts
- FakeSessionService
- devDependencies
- agentic-remote
- session-resources.ts
- SessionKnowledgeStore
- dependencies
- CopilotSessionLike
- agentic-remote-promotion-setup
- app.ts
- tmux-errors.integration.test.ts
- session-presentation.ts
- terminal-startup-queue.test.ts
- shell.ts
- scripts
- delegated-transcription-service.ts
- computer-manager-metadata.test.ts
- PushNotificationService
- KnowledgeStore
- active-sessions.ts
- session-resource-clear.test.ts
- SessionOrderStore
- compilerOptions
- .sendInternal
- transcription-service.ts
- node-routes.ts
- capture-workspace.ts
- SessionMcpServersSnapshot
- session-knowledge-store.ts
- BackgroundTaskSnapshot
- NewSessionDialog
- session-enqueue-clear.test.ts
- session-reply-durability.test.ts
- session-clear-transcript.test.ts
- session-store-providers.test.ts
- compilerOptions
- compilerOptions
- check-workspace-review-regressions.ts
- compilerOptions
- session-resource-routes.test.ts
- workspace-browser.ts
- normalizeKnowledgeRelativePath
- CopilotClientLike
- react
- directory-browser.ts
- use-session-knowledge-root.ts
- ReaderWorkspace
- recovery-resend-durability.test.ts
- capture
- desktop.json
- registerSessionKnowledgeRoutes
- capture-workbench-review.ts
- package.json
- workspace-fixtures.ts
- .oxlintrc.json
- settings-local.json
- push-notification-service.ts
- TranscriptionError
- scripts
- claude-agent-service.ts
- ResourceReads
- promotion-monitor.test.ts
- recovery-seed-guards.test.ts
- BackgroundTasksDialog.tsx
- html-preview.ts
- shell-notifications.ts
- submission-error.ts
- session-knowledge-routes.ts
- setupWorkspaceFixture
- generate-pwa-icons.ts
- claude-agent-service.test.ts
- SessionResources.tsx
- bridge.rs
- screenshot-stability.test.ts
- KnowledgePosition
- DirectoryListing
- remote-node-client.test.ts
- session-resource-transport.ts
- session-store-durability.test.ts
- SessionFileUpload
- release-publication.test.ts
- recovery-context.ts
- settings.ts
- composer-layout.test.ts
- session-order-routes.test.ts
- hasRunningBackgroundAgent
- removeComputer
- .discoverTerminalSessions
- promotion-setup-execution.test.ts
- MockMediaRecorder
- KnowledgeRootSelector.tsx
- version-policy.test.ts
- queued-commands.ts
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

## Communities (147 total, 23 thin omitted)

### Community 0 - "App"
Cohesion: 0.04
Nodes (122): saveSessionOrderLane(), activeComposerPastes(), App(), adoptConversationReplacement(), appendComposerForKey(), appKeyDown(), applyComputerSnapshot(), applySession() (+114 more)

### Community 1 - "SessionStore"
Cohesion: 0.04
Nodes (53): fixture(), holdProbe(), fixtures, gate(), releases, connect(), createStore(), deferred() (+45 more)

### Community 2 - "AgentService"
Cohesion: 0.05
Nodes (10): agentMode(), AgentService, isForegroundCompletionEvent(), isForegroundLifecycleEvent(), isMissingSessionError(), removeCopilotSessionFiles(), RuntimeConfigurationError, statusFromEvents() (+2 more)

### Community 3 - "api.ts"
Cohesion: 0.04
Nodes (109): parseSubmissionReceipt(), submissionReceiptFromError(), addKnowledgeRoot(), bootstrapSessionOrder(), cancelBackgroundTask(), cancelSession(), clearConversation(), definiteDispatchRefusals (+101 more)

### Community 4 - "App.tsx"
Cohesion: 0.03
Nodes (93): configureRuntime(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph() (+85 more)

### Community 5 - "contracts.ts"
Cohesion: 0.03
Nodes (66): AgentServiceEvents, CreationRuntime, ServerRole, ClaudeAgentServiceEvents, RemoteResync, RemoteSessionListing, RemoteSessionRead, sessionAtLeastAsNew() (+58 more)

### Community 6 - "queueConflict"
Cohesion: 0.04
Nodes (35): enqueue(), acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight(), preparePrompt() (+27 more)

### Community 7 - "background-task-adapter.ts"
Cohesion: 0.07
Nodes (69): addActivity(), attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), boundedText(), errorValue() (+61 more)

### Community 8 - "ComputerManager"
Cohesion: 0.10
Nodes (11): ComputerManager, managedSession(), RegisteredComputer, registerHubRoutes(), SessionMuteCarrier, FakeManager, createHub(), ComputerSummary (+3 more)

### Community 9 - "ClaudeAgentService"
Cohesion: 0.06
Nodes (7): ClaudeAgentService, isMissingClaudeSessionError(), answer(), claudeRequest(), copilotRequest(), holdOtherWrite(), RuntimeModelOption

### Community 10 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (67): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+59 more)

### Community 11 - "markdown-navigation.ts"
Cohesion: 0.06
Nodes (54): UserInputField, UserInputFieldValue, followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), MarkdownImage(), missingDocumentFragment(), WorkspaceDialog() (+46 more)

### Community 12 - "agent-service.ts"
Cohesion: 0.07
Nodes (59): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, ansiSequence (+51 more)

### Community 13 - ".get"
Cohesion: 0.08
Nodes (3): isUncertainDelivery(), TerminalSessionController, deliveryUncertaintyFromError()

### Community 14 - "terminal-session.test.ts"
Cohesion: 0.07
Nodes (43): directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), exec, formFixture(), horizontalFormFixture() (+35 more)

### Community 15 - "terminal-session.ts"
Cohesion: 0.10
Nodes (51): activeBottomFrame(), boxedComposerFrame(), cleanDialogLine(), clearAutomaticStartupPrompts(), COMPOSER_PLACEHOLDERS, composerFrameText(), containsCopiedInteractiveFrame(), desktopInstallPromptIdentity() (+43 more)

### Community 16 - "TmuxTerminalSessionController"
Cohesion: 0.10
Nodes (16): composer(), processAdapter, copilotCommand(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand(), processIsAlive() (+8 more)

### Community 17 - "SessionDetail"
Cohesion: 0.10
Nodes (3): persistedFormAnswer(), fixture(), SessionDetail

### Community 18 - "RemoteNodeClient"
Cohesion: 0.07
Nodes (9): headerSafe(), RemoteNodeClient, AudioTranscription, NodeInfo, RemovedQueuedPrompt, WorkspaceFile, WorkspaceListing, KnowledgeFolderState (+1 more)

### Community 19 - "pwa.ts"
Cohesion: 0.09
Nodes (39): directories, AppVersion, parseAppVersion(), deletePushSubscription(), getProviderRuntimeOptions(), getPushPublicKey(), savePushSubscription(), sendTestPushNotification() (+31 more)

### Community 20 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 21 - "SessionService"
Cohesion: 0.09
Nodes (4): registerNodeRoutes(), readServiceResources(), readSessionMcpServers(), SessionService

### Community 22 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 24 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 25 - "hub-routes.ts"
Cohesion: 0.06
Nodes (36): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+28 more)

### Community 26 - "knowledge-tree.ts"
Cohesion: 0.09
Nodes (34): WorkspaceEntry, listKnowledgeEntries(), readKnowledgeFile(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor() (+26 more)

### Community 27 - "FakeSessionService"
Cohesion: 0.08
Nodes (4): FakeSessionService, routingFixture(), session(), temporaryDirectory()

### Community 28 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 29 - "agentic-remote"
Cohesion: 0.13
Nodes (31): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+23 more)

### Community 30 - "session-resources.ts"
Cohesion: 0.18
Nodes (30): claudeMcp(), claudeSkillNames(), copilotMcp, copilotSkills, copilotWorkspaceMcp, CopilotWorkspaceSkills, count(), enrichClaudeSkills() (+22 more)

### Community 31 - "SessionKnowledgeStore"
Cohesion: 0.13
Nodes (10): bindingKey(), SessionKnowledgeConflictError, SessionKnowledgeRecoveryError, SessionKnowledgeStore, disk, fixture(), fixtures, releases (+2 more)

### Community 32 - "dependencies"
Cohesion: 0.06
Nodes (33): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, @fastify/multipart, @fastify/static, @fastify/websocket, ffmpeg-static (+25 more)

### Community 33 - "CopilotSessionLike"
Cohesion: 0.08
Nodes (13): CopilotSessionLike, terminalFormSteps(), configurableModel(), DeferredSession, directories, FakeCopilotClient, services, startupFifoFixture() (+5 more)

### Community 34 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (30): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+22 more)

### Community 35 - "app.ts"
Cohesion: 0.11
Nodes (20): prefixes, session, trusted, untrusted, buildApp(), errorStatusCode(), isAppleTouchIconProbe(), transcriptionComputerName() (+12 more)

### Community 36 - "tmux-errors.integration.test.ts"
Cohesion: 0.09
Nodes (21): execFileAsync, headers, ignoreMissing(), removeFixture(), seedSession(), sessionLog(), stopOwnedServer(), noTmuxServer() (+13 more)

### Community 37 - "session-presentation.ts"
Cohesion: 0.15
Nodes (25): attentionRank, computerTone(), executionModeName(), matchesSessionSearch(), providerName(), recentFirst(), sessionActivityTime(), sessionDay (+17 more)

### Community 38 - "terminal-startup-queue.test.ts"
Cohesion: 0.14
Nodes (25): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+17 more)

### Community 39 - "shell.ts"
Cohesion: 0.15
Nodes (25): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), onShellDeepLink(), onShellNotificationReply(), openShellSettings() (+17 more)

### Community 40 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 41 - "delegated-transcription-service.ts"
Cohesion: 0.11
Nodes (12): BuildAppOptions, collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation (+4 more)

### Community 42 - "computer-manager-metadata.test.ts"
Cohesion: 0.12
Nodes (10): fixture(), managers, releases, remote, session(), ComputerRegistry, RegistryState, directories (+2 more)

### Community 43 - "PushNotificationService"
Cohesion: 0.19
Nodes (3): HubEventSource, PushNotificationService, registerPushRoutes()

### Community 44 - "KnowledgeStore"
Cohesion: 0.18
Nodes (7): WorkspaceFixtureState, KnowledgeRootReservation, KnowledgeState, KnowledgeStore, directories, fixture(), KnowledgeRoot

### Community 45 - "active-sessions.ts"
Cohesion: 0.19
Nodes (24): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+16 more)

### Community 46 - "session-resource-clear.test.ts"
Cohesion: 0.10
Nodes (23): ClaudeSdk, apps, directories, directory(), obstructUploads(), pairedFixture(), providerFixture(), providers (+15 more)

### Community 47 - "SessionOrderStore"
Cohesion: 0.19
Nodes (9): orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState, SessionOrderStore, directories, store() (+1 more)

### Community 48 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 49 - ".sendInternal"
Cohesion: 0.20
Nodes (16): capturePane(), composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), isTerminalAgentWorking(), isTerminalOverlay(), isTerminalSessionInUsePrompt() (+8 more)

### Community 50 - "transcription-service.ts"
Cohesion: 0.11
Nodes (19): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+11 more)

### Community 51 - "node-routes.ts"
Cohesion: 0.09
Nodes (22): AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema (+14 more)

### Community 52 - "capture-workspace.ts"
Cohesion: 0.19
Nodes (21): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+13 more)

### Community 53 - "SessionMcpServersSnapshot"
Cohesion: 0.16
Nodes (9): ClaudeResources, isResourceMethodUnavailable(), readSessionSkills(), safeResourceError(), unavailableMcp(), unavailableSkills(), SessionMcpServersSnapshot, SessionResourceSnapshot (+1 more)

### Community 54 - "session-knowledge-store.ts"
Cohesion: 0.10
Nodes (20): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+12 more)

### Community 55 - "BackgroundTaskSnapshot"
Cohesion: 0.11
Nodes (18): BackgroundTaskSnapshot, SessionFilter, sessionNavigationView, computers, first, grouped, hidden, last (+10 more)

### Community 56 - "NewSessionDialog"
Cohesion: 0.15
Nodes (22): activateSession(), createSession(), executeCommand(), listDirectories(), listHistory(), listWorkspace(), validateSessionDirectory(), AddKnowledgeRootDialog() (+14 more)

### Community 57 - "session-enqueue-clear.test.ts"
Cohesion: 0.13
Nodes (16): deferred(), disk, enqueue(), fixtures, holdAdmissionWrite(), releases, disk, EnqueueCase (+8 more)

### Community 58 - "session-reply-durability.test.ts"
Cohesion: 0.15
Nodes (16): TerminalFormContinuation, assistantFixture(), claudeFixture(), claudeQuestions(), claudeRunFixture(), copilotFixture(), copilotRunFixture(), disk (+8 more)

### Community 59 - "session-clear-transcript.test.ts"
Cohesion: 0.11
Nodes (9): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions, disk, fixtures, gate(), holdTurnWrite() (+1 more)

### Community 60 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (10): claude(), clearFixture(), copilot(), disk, event(), fixture(), fixtures, releases (+2 more)

### Community 61 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

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

### Community 66 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 67 - "normalizeKnowledgeRelativePath"
Cohesion: 0.22
Nodes (15): joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath(), slashPath(), scopedKnowledgeRoot(), KnowledgeRootChoice (+7 more)

### Community 68 - "CopilotClientLike"
Cohesion: 0.11
Nodes (8): CopilotClientLike, fixtures, recoverAndSeed(), releases, boots, [directory, backend, resultPath, phase = 'idle'], fixtureRoot, CopilotResourceClient

### Community 69 - "react"
Cohesion: 0.14
Nodes (9): react, DialogFrame(), MarkdownCodeBlock(), copy(), originalClipboard, drawDiagram(), drawing, MermaidDiagram() (+1 more)

### Community 70 - "directory-browser.ts"
Cohesion: 0.28
Nodes (11): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin(), SessionDirectoryError (+3 more)

### Community 71 - "use-session-knowledge-root.ts"
Cohesion: 0.21
Nodes (12): getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey(), knowledgePositionForBinding(), SessionIdentity (+4 more)

### Community 72 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 73 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 74 - "capture"
Cohesion: 0.18
Nodes (15): releaseRecording(), shortcutKeys(), startRecording(), stopRecording(), binding(), bindingLabel(), capturableCode(), isModifierCode() (+7 more)

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

### Community 80 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 81 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 82 - "push-notification-service.ts"
Cohesion: 0.15
Nodes (10): brief(), PushSender, PushState, directories, RFC-8030, RFC-8030, sessionMuteSchema, subscriptionSchema (+2 more)

### Community 83 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 84 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+4 more)

### Community 85 - "claude-agent-service.ts"
Cohesion: 0.17
Nodes (10): AuthStatusRunner, ClaudeQuestion, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission, PendingClaudeReply, toolResultText() (+2 more)

### Community 86 - "ResourceReads"
Cohesion: 0.21
Nodes (6): ActiveClaudeQuery, releases, session, snapshot, ResourceReads, resourceRequestHandler()

### Community 87 - "promotion-monitor.test.ts"
Cohesion: 0.30
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 88 - "recovery-seed-guards.test.ts"
Cohesion: 0.18
Nodes (8): bootLegacy(), directories, execute, pending, releases, SeedState, services, stores

### Community 89 - "BackgroundTasksDialog.tsx"
Cohesion: 0.27
Nodes (9): BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive(), taskStatusLabel() (+1 more)

### Community 90 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 91 - "shell-notifications.ts"
Cohesion: 0.29
Nodes (9): key(), label(), NotifiableSession, notificationState(), requestId(), SessionNotificationState, ShellNotificationContext, shellNotifications() (+1 more)

### Community 92 - "submission-error.ts"
Cohesion: 0.31
Nodes (6): RemoteNodeRedirectError, RemoteNodeRequestError, httpDeliveryUncertain(), legacyDefinitiveHttpRefusals, SubmissionError, SubmissionReceipt

### Community 93 - "session-knowledge-routes.ts"
Cohesion: 0.18
Nodes (6): Lineage, RegistrationGeneration, ReplacementEvidence, SessionKnowledgeLifecycle, sessionParams, updateSchema

### Community 94 - "setupWorkspaceFixture"
Cohesion: 0.24
Nodes (6): pageFor(), createWorkspaceFixtureState(), fixtureBaseUrl(), fixtureValue(), setupWorkspaceFixture(), fixtureApi()

### Community 95 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 96 - "claude-agent-service.test.ts"
Cohesion: 0.22
Nodes (6): cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle()

### Community 97 - "SessionResources.tsx"
Cohesion: 0.20
Nodes (7): SessionMcpServerSummary, SessionResourceSource, SessionSkillSummary, Catalog, CatalogResult, sourceLabels, statusLabels

### Community 98 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 99 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 100 - "KnowledgePosition"
Cohesion: 0.33
Nodes (5): WorkspaceFixtureOptions, KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 102 - "remote-node-client.test.ts"
Cohesion: 0.28
Nodes (5): client(), servers, session, TERMINAL_REQUEST_TIMEOUT_MS, TERMINAL_STARTUP_TIMEOUT_MS

### Community 103 - "session-resource-transport.ts"
Cohesion: 0.36
Nodes (7): readClaudeMcp(), readCopilotResource(), copilotTransport(), disposals, Frame, write(), unavailable()

### Community 104 - "session-store-durability.test.ts"
Cohesion: 0.31
Nodes (7): disk, fixture(), fixtures, prompt(), ready(), releases, session()

### Community 106 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 107 - "recovery-context.ts"
Cohesion: 0.38
Nodes (4): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief

### Community 108 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 109 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 110 - "session-order-routes.test.ts"
Cohesion: 0.50
Nodes (3): directories, fakeManager(), hub()

### Community 112 - "removeComputer"
Cohesion: 0.60
Nodes (5): addComputer(), removeComputer(), ComputersDialog(), remove(), submit()

## Knowledge Gaps
- **663 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+658 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1003 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **23 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `session-resource-routes.test.ts`, `DirectoryListing`, `queueConflict`, `SessionFileUpload`, `agent-service.ts`, `.get`, `SessionDetail`, `.discoverTerminalSessions`, `SessionMcpServersSnapshot`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `RemoteNodeClient` connect `RemoteNodeClient` to `SessionFileUpload`, `DirectoryListing`, `SessionMcpServersSnapshot`, `contracts.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionStore` to `AgentService`, `queueConflict`, `ClaudeAgentService`, `SessionFileUpload`, `.get`, `SessionDetail`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _663 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.04042933810375671 - nodes in this community are weakly interconnected._
- **Should `SessionStore` be split into smaller, more focused modules?**
  _Cohesion score 0.03637045369328834 - nodes in this community are weakly interconnected._
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
