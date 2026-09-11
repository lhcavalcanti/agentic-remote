# Agentic Remote - Graphify code map

Snapshot: `2d28c63f6ae13554b5d62cf74ca7e79947bd53d3487824e1d8cf16505eff52ef`

Source checkout: `b54b0439bb972e1e423be6710a124a139d3fbd21`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 220 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 220 files · ~448,678 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3398 nodes · 9599 edges · 141 communities (106 shown, 22 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 710 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App
- App.tsx
- api.ts
- SessionDetail
- ClaudeAgentService
- session-resources.ts
- SessionKnowledgeStore
- agentic-remote-promotion-monitor
- session-presentation.ts
- markdown-navigation.ts
- terminal-session.ts
- claude-agent-service.ts
- agent-service.ts
- contracts.ts
- RemoteNodeClient
- AgentService
- queueConflict
- ComputerManager
- bundle
- TmuxTerminalSessionController
- SessionService
- pwa.ts
- terminal-startup-queue.test.ts
- .get
- sessionKey
- lib.rs
- session-knowledge-routes.test.ts
- ProviderSessionService
- shell.ts
- background-task-adapter.ts
- config.rs
- devDependencies
- .publish
- hub-routes.ts
- FakeSessionService
- dependencies
- agentic-remote
- .readAfterWrites
- .sendAdmittedWithBackend
- knowledge-tree.ts
- agentic-remote-promotion-setup
- session-admission-lifecycle.test.ts
- tmux-errors.integration.test.ts
- app.ts
- terminal-session.test.ts
- session-reply-durability.test.ts
- delegated-transcription-service.ts
- scripts
- .handleSessionEvent
- .initialize
- PushNotificationService
- directory-browser.ts
- CopilotClientLike
- ComputerSummary
- compilerOptions
- active-sessions.ts
- BackgroundTasksDialog.tsx
- transcription-service.ts
- node-routes.ts
- session-store.ts
- capture-workspace.ts
- session-store-providers.test.ts
- remote-node-client.ts
- workspace-browser.ts
- compilerOptions
- .replyUserInputInternal
- session-resource-routes.test.ts
- session-enqueue-clear.test.ts
- compilerOptions
- check-workspace-review-regressions.ts
- compilerOptions
- recordValue
- event-log.ts
- NodeIdentityStore
- NewSessionDialog
- queued-provider-dispatch.test.ts
- ReaderWorkspace
- agent-service.test.ts
- background-task-stop.test.ts
- session-resource-providers.test.ts
- recovery-resend-durability.test.ts
- queued-dispatch.test.ts
- workspace-fixtures.ts
- desktop.json
- .acknowledgeFailedPrompt
- session-resource-clear.test.ts
- capture-workbench-review.ts
- package.json
- .oxlintrc.json
- settings-local.json
- push-notification-service.ts
- TranscriptionError
- session-response-order.ts
- promotion-monitor.test.ts
- recovery-seed-guards.test.ts
- SessionAdmissions
- html-preview.ts
- scripts
- DeferredSession
- bridge.rs
- setupWorkspaceFixture
- screenshot-stability.test.ts
- session-resource-transport.ts
- KnowledgePosition
- DocumentViewControls.tsx
- recovery-context.ts
- settings.ts
- composer-layout.test.ts
- release-publication.test.ts
- session-navigation-view.test.ts
- MarkdownCodeBlock.tsx
- terminal-send-uncertainty.test.ts
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
2. `App()` - 236 edges
3. `AgentService` - 217 edges
4. `SessionStore` - 150 edges
5. `ClaudeAgentService` - 118 edges
6. `ComputerManager` - 79 edges
7. `SessionService` - 70 edges
8. `RemoteNodeClient` - 65 edges
9. `registerHubRoutes()` - 62 edges
10. `TmuxTerminalSessionController` - 56 edges

## Surprising Connections (you probably didn't know these)
- `submit()` --indirect_call--> `provider()`  [INFERRED]
  src/App.tsx → server/provider-session-service.test.ts
- `composerKeyDown()` --indirect_call--> `composer()`  [INFERRED]
  src/App.tsx → server/terminal-send-uncertainty.test.ts
- `AcceptedSdkReply` --references--> `SessionDetail`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `AgentServiceEvents` --references--> `ServerEvent`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `BackgroundTaskUpdate` --references--> `BackgroundTaskSnapshot`  [EXTRACTED]
  server/background-task-tracker.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (141 total, 22 thin omitted)

### Community 0 - "App"
Cohesion: 0.04
Nodes (128): submissionReceiptFromError(), replyPermission(), activeComposerPastes(), App(), adoptConversationReplacement(), answerUserInput(), appendComposerForKey(), appKeyDown() (+120 more)

### Community 1 - "App.tsx"
Cohesion: 0.03
Nodes (103): accentIconUrl(), applyAccentIcon(), addComputer(), configureRuntime(), removeComputer(), AccentTheme, accentThemes, activityKindFromMessage() (+95 more)

### Community 2 - "api.ts"
Cohesion: 0.05
Nodes (93): parseSubmissionReceipt(), activateSession(), addKnowledgeRoot(), cancelBackgroundTask(), cancelSession(), clearConversation(), createSession(), definiteDispatchRefusals (+85 more)

### Community 3 - "SessionDetail"
Cohesion: 0.07
Nodes (11): fixture(), observe(), clearRecoverySeedFailure(), cloneSession(), ownsRecoverySeedFailure(), SessionStore, acceptedStartupRecovery(), fixture() (+3 more)

### Community 4 - "ClaudeAgentService"
Cohesion: 0.06
Nodes (4): ClaudeAgentService, isMissingClaudeSessionError(), QueuedPromptReservation, RuntimeModelOption

### Community 5 - "session-resources.ts"
Cohesion: 0.08
Nodes (51): ActiveClaudeQuery, ClaudeResources, releases, session, snapshot, claudeMcp(), claudeSkillNames(), copilotMcp (+43 more)

### Community 6 - "SessionKnowledgeStore"
Cohesion: 0.06
Nodes (38): Lineage, registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession() (+30 more)

### Community 7 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (67): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+59 more)

### Community 8 - "session-presentation.ts"
Cohesion: 0.06
Nodes (48): react, DialogFrame(), KnowledgeRootSelector(), root, SessionFilter, sessionNavigationView, attentionRank, computerTone() (+40 more)

### Community 9 - "markdown-navigation.ts"
Cohesion: 0.07
Nodes (50): UserInputField, UserInputFieldValue, followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), MarkdownImage(), missingDocumentFragment(), WorkspaceDialog() (+42 more)

### Community 10 - "terminal-session.ts"
Cohesion: 0.10
Nodes (48): activeBottomFrame(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), COMPOSER_PLACEHOLDERS, containsCopiedInteractiveFrame(), desktopInstallPromptIdentity(), findTerminalWrappedText() (+40 more)

### Community 11 - "claude-agent-service.ts"
Cohesion: 0.07
Nodes (24): CreationRuntime, AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission (+16 more)

### Community 12 - "agent-service.ts"
Cohesion: 0.05
Nodes (46): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), ActivityToolStart, AgentServiceEvents, ansiSequence, commandShortcut() (+38 more)

### Community 13 - "contracts.ts"
Cohesion: 0.05
Nodes (34): managers, releases, remote, RemoteResync, RemoteSessionRead, RegistryState, StoredNodeIdentity, normalizeNodeUrl() (+26 more)

### Community 14 - "RemoteNodeClient"
Cohesion: 0.06
Nodes (9): headerSafe(), RemoteNodeClient, client(), NodeInfo, RemovedQueuedPrompt, WorkspaceFile, WorkspaceListing, KnowledgeFolderState (+1 more)

### Community 15 - "AgentService"
Cohesion: 0.08
Nodes (3): AgentService, RuntimeConfigurationError, fixture()

### Community 16 - "queueConflict"
Cohesion: 0.09
Nodes (19): CopilotSessionLike, CopilotTasksApi, acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight() (+11 more)

### Community 17 - "ComputerManager"
Cohesion: 0.18
Nodes (7): ComputerManager, managedSession(), RemoteSessionListing, registerHubRoutes(), ManagedRemovedQueuedPrompt, ManagedSession, SessionListing

### Community 18 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 19 - "TmuxTerminalSessionController"
Cohesion: 0.13
Nodes (11): copilotCommand(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand(), safeWindowName(), submitTerminalForm(), tmuxTargetForPid() (+3 more)

### Community 21 - "pwa.ts"
Cohesion: 0.10
Nodes (36): directories, AppVersion, parseAppVersion(), deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart() (+28 more)

### Community 22 - "terminal-startup-queue.test.ts"
Cohesion: 0.10
Nodes (32): directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), exec, formFixture(), horizontalFormFixture() (+24 more)

### Community 23 - ".get"
Cohesion: 0.11
Nodes (3): isMissingSessionError(), removeCopilotSessionFiles(), hasRunningBackgroundAgent()

### Community 24 - "sessionKey"
Cohesion: 0.09
Nodes (33): joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), slashPath(), getSessionKnowledgeRoot(), updateSessionKnowledgeRoot(), cancelSelectedBackgroundTask() (+25 more)

### Community 25 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 26 - "session-knowledge-routes.test.ts"
Cohesion: 0.07
Nodes (20): ServerRole, SessionMetadataLookup, SessionMuteCarrier, KnowledgeState, KnowledgeStore, directories, disk, FakeManager (+12 more)

### Community 28 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 29 - "background-task-adapter.ts"
Cohesion: 0.13
Nodes (37): addActivity(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), boundedText(), CopilotTaskInfo, CopilotTaskProgress, errorValue(), eventTask() (+29 more)

### Community 30 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 31 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 32 - ".publish"
Cohesion: 0.10
Nodes (5): agentMode(), isForegroundCompletionEvent(), isForegroundLifecycleEvent(), statusFromEvents(), TranscriptObservation

### Community 33 - "hub-routes.ts"
Cohesion: 0.07
Nodes (33): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+25 more)

### Community 34 - "FakeSessionService"
Cohesion: 0.08
Nodes (4): FakeSessionService, routingFixture(), session(), temporaryDirectory()

### Community 35 - "dependencies"
Cohesion: 0.06
Nodes (33): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/static, @fastify/websocket, ffmpeg-static (+25 more)

### Community 36 - "agentic-remote"
Cohesion: 0.14
Nodes (30): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+22 more)

### Community 39 - "knowledge-tree.ts"
Cohesion: 0.11
Nodes (28): applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor(), knowledgeTreeKeyDown(), loadKnowledgeChain(), loadKnowledgeFolder() (+20 more)

### Community 40 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (28): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+20 more)

### Community 41 - "session-admission-lifecycle.test.ts"
Cohesion: 0.08
Nodes (20): deferred(), disk, enqueue(), fixture(), fixtures, holdAdmissionWrite(), releases, disk (+12 more)

### Community 42 - "tmux-errors.integration.test.ts"
Cohesion: 0.09
Nodes (21): execFileAsync, headers, ignoreMissing(), removeFixture(), seedSession(), sessionLog(), stopOwnedServer(), noTmuxServer() (+13 more)

### Community 43 - "app.ts"
Cohesion: 0.12
Nodes (18): prefixes, session, trusted, untrusted, buildApp(), errorStatusCode(), transcriptionComputerName(), FileUploadError (+10 more)

### Community 44 - "terminal-session.test.ts"
Cohesion: 0.11
Nodes (26): composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), occurrences(), paneEvidenceCount(), paneShowsText(), parseTerminalUpdateNotice() (+18 more)

### Community 45 - "session-reply-durability.test.ts"
Cohesion: 0.13
Nodes (18): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRequest() (+10 more)

### Community 46 - "delegated-transcription-service.ts"
Cohesion: 0.12
Nodes (13): BuildAppOptions, collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation (+5 more)

### Community 47 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 48 - ".handleSessionEvent"
Cohesion: 0.19
Nodes (21): activityKind(), activityResult(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), isBackgroundTaskEvent(), isRuntimeReasoningEffort() (+13 more)

### Community 49 - ".initialize"
Cohesion: 0.10
Nodes (16): connect(), createStore(), deferred(), disk, enqueue(), fixture(), fixtures, holdClaimWrite() (+8 more)

### Community 50 - "PushNotificationService"
Cohesion: 0.19
Nodes (3): HubEventSource, PushNotificationService, registerPushRoutes()

### Community 51 - "directory-browser.ts"
Cohesion: 0.17
Nodes (13): DirectoryScope, displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin() (+5 more)

### Community 52 - "CopilotClientLike"
Cohesion: 0.08
Nodes (13): CopilotClientLike, fixture(), holdProbe(), fixtures, gate(), releases, fixtures, recoverAndSeed() (+5 more)

### Community 53 - "ComputerSummary"
Cohesion: 0.15
Nodes (5): fixture(), session(), sessionAtLeastAsNew(), RegisteredComputer, ComputerSummary

### Community 54 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 55 - "active-sessions.ts"
Cohesion: 0.19
Nodes (23): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+15 more)

### Community 56 - "BackgroundTasksDialog.tsx"
Cohesion: 0.14
Nodes (15): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask, BackgroundTaskCard(), BackgroundTasksDialog() (+7 more)

### Community 57 - "transcription-service.ts"
Cohesion: 0.11
Nodes (19): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+11 more)

### Community 58 - "node-routes.ts"
Cohesion: 0.09
Nodes (22): AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema (+14 more)

### Community 59 - "session-store.ts"
Cohesion: 0.09
Nodes (18): activityDuration(), activityResultPreview(), archivedMessage(), DiscoveredSession, emptyRetirements, PendingChange, RecoveryResend, RecoverySeed (+10 more)

### Community 60 - "capture-workspace.ts"
Cohesion: 0.19
Nodes (21): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+13 more)

### Community 61 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (11): claude(), clearFixture(), copilot(), disk, event(), fixture(), fixtures, holdOtherWrite() (+3 more)

### Community 62 - "remote-node-client.ts"
Cohesion: 0.15
Nodes (12): DEFINITE_DISPATCH_REFUSALS, REDIRECT_STATUSES, RemoteNodeClientEvents, servers, session, RemoteNodeRedirectError, RemoteNodeRequestError, httpDeliveryUncertain() (+4 more)

### Community 63 - "workspace-browser.ts"
Cohesion: 0.19
Nodes (17): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+9 more)

### Community 64 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 65 - ".replyUserInputInternal"
Cohesion: 0.21
Nodes (6): persistedFormAnswer(), TerminalFormContinuation, validateUserInputForm(), TerminalFormReplyError, PendingUserInput, UserInputReplyInput

### Community 66 - "session-resource-routes.test.ts"
Cohesion: 0.12
Nodes (9): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription (+1 more)

### Community 67 - "session-enqueue-clear.test.ts"
Cohesion: 0.14
Nodes (16): ClaudeSdk, cleanupFixtures(), directories, fixture(), queryHandle(), services, disk, EnqueueCase (+8 more)

### Community 68 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 69 - "check-workspace-review-regressions.ts"
Cohesion: 0.13
Nodes (15): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+7 more)

### Community 70 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 71 - "recordValue"
Cohesion: 0.18
Nodes (19): attachmentModeValue(), backgroundHandoff(), booleanValue(), eventString(), lastForegroundCompletionAt(), normalizedToolName(), notificationKind(), parsedValue() (+11 more)

### Community 72 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 73 - "NodeIdentityStore"
Cohesion: 0.18
Nodes (4): ComputerRegistry, directories, remoteSnapshotFixture(), NodeIdentityStore

### Community 74 - "NewSessionDialog"
Cohesion: 0.18
Nodes (18): executeCommand(), listDirectories(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), moveSessionToBrowsedFolder(), ChangeDirectoryDialog(), browseDirectory() (+10 more)

### Community 75 - "queued-provider-dispatch.test.ts"
Cohesion: 0.15
Nodes (9): claudeFixture(), copilotFixture(), copilotSession(), fixtures, gate(), originalQueue, pause(), releases (+1 more)

### Community 76 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 77 - "agent-service.test.ts"
Cohesion: 0.15
Nodes (7): terminalFormSteps(), configurableModel(), directories, FakeCopilotClient, services, startupFifoFixture(), UserInputForm

### Community 78 - "background-task-stop.test.ts"
Cohesion: 0.21
Nodes (13): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), snapshot() (+5 more)

### Community 79 - "session-resource-providers.test.ts"
Cohesion: 0.18
Nodes (14): waitForIdle(), claudeFixture(), ClaudeMcpRead, copilotFixture(), deferred(), directory(), DiscoveredMcp, DiscoveredSkills (+6 more)

### Community 80 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 81 - "queued-dispatch.test.ts"
Cohesion: 0.15
Nodes (8): deferred(), disk, fixture(), fixtures, holdWrite(), prompt(), releases, target

### Community 82 - "workspace-fixtures.ts"
Cohesion: 0.15
Nodes (13): documents, FIXTURE_NOW, fixtureBackgroundTasks, fixtureEndpoints, fixtureKnowledgeListings, fixtureKnowledgePositions, fixtureModels, runtime (+5 more)

### Community 83 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 84 - ".acknowledgeFailedPrompt"
Cohesion: 0.31
Nodes (3): isUncertainDelivery(), deliveryUncertaintyFromError(), SubmissionError

### Community 85 - "session-resource-clear.test.ts"
Cohesion: 0.19
Nodes (13): apps, directories, directory(), obstructUploads(), pairedFixture(), providerFixture(), providers, seed() (+5 more)

### Community 86 - "capture-workbench-review.ts"
Cohesion: 0.17
Nodes (10): frame(), geometry, output, scratch, screenshot(), { values }, fixtureSessions, IDLE_SESSION_ID (+2 more)

### Community 87 - "package.json"
Cohesion: 0.15
Nodes (11): directory, { values }, workflows, name, packageManager, pnpm, onlyBuiltDependencies, private (+3 more)

### Community 88 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 89 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 90 - "push-notification-service.ts"
Cohesion: 0.15
Nodes (10): brief(), PushSender, PushState, directories, RFC-8030, RFC-8030, sessionMuteSchema, subscriptionSchema (+2 more)

### Community 91 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 92 - "session-response-order.ts"
Cohesion: 0.27
Nodes (11): sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), currentSessionEventSequence(), nextSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences (+3 more)

### Community 93 - "promotion-monitor.test.ts"
Cohesion: 0.30
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 94 - "recovery-seed-guards.test.ts"
Cohesion: 0.18
Nodes (8): bootLegacy(), directories, execute, pending, releases, SeedState, services, stores

### Community 95 - "SessionAdmissions"
Cohesion: 0.20
Nodes (4): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions

### Community 96 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 97 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, check, dev, dev:server, dev:web, lint, start (+3 more)

### Community 99 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 100 - "setupWorkspaceFixture"
Cohesion: 0.25
Nodes (6): pageFor(), createWorkspaceFixtureState(), fixtureBaseUrl(), fixtureValue(), setupWorkspaceFixture(), fixtureApi()

### Community 101 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 102 - "session-resource-transport.ts"
Cohesion: 0.36
Nodes (7): readClaudeMcp(), readCopilotResource(), copilotTransport(), disposals, Frame, write(), unavailable()

### Community 103 - "KnowledgePosition"
Cohesion: 0.36
Nodes (4): WorkspaceFixtureOptions, KnowledgePosition, KnowledgeRestoreState, base

### Community 104 - "DocumentViewControls.tsx"
Cohesion: 0.29
Nodes (4): DocumentViewControls(), actions, outline, DocumentHeading

### Community 105 - "recovery-context.ts"
Cohesion: 0.38
Nodes (4): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief

### Community 106 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 107 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 108 - "release-publication.test.ts"
Cohesion: 0.40
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 109 - "session-navigation-view.test.ts"
Cohesion: 0.33
Nodes (5): computers, first, grouped, hidden, last

### Community 114 - "MermaidDiagram.tsx"
Cohesion: 0.67
Nodes (3): drawDiagram(), drawing, MermaidDiagram()

## Knowledge Gaps
- **643 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+638 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 970 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **22 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `connect()` connect `.initialize` to `SessionDetail`, `ClaudeAgentService`, `AgentService`, `.get`, `ProviderSessionService`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `AgentService` connect `AgentService` to `.publish`, `.replyUserInputInternal`, `session-resource-routes.test.ts`, `.readAfterWrites`, `.sendAdmittedWithBackend`, `session-resources.ts`, `claude-agent-service.ts`, `queueConflict`, `.handleSessionEvent`, `directory-browser.ts`, `.acknowledgeFailedPrompt`, `.get`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `RemoteNodeClient` connect `RemoteNodeClient` to `ComputerSummary`, `directory-browser.ts`, `claude-agent-service.ts`, `contracts.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _643 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.03540305010893246 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.027055844328935093 - nodes in this community are weakly interconnected._
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
