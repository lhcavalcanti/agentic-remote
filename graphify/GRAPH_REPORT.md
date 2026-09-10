# Agentic Remote - Graphify code map

Snapshot: `514e1ba0abd884864d057f69be7a4afd5dfe63ce3c4273763908dd70c185851e`

Source checkout: `c098c9a36728fa723e7319a62a1e50a98355edaa`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 205 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 205 files · ~422,866 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3258 nodes · 9089 edges · 134 communities (100 shown, 21 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 659 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- SessionDetail
- App
- api.ts
- App.tsx
- contracts.ts
- ClaudeAgentService
- session-resources.ts
- SessionKnowledgeStore
- agentic-remote-promotion-monitor
- queued-dispatch.test.ts
- session-presentation.ts
- claude-agent-service.ts
- agent-service.ts
- terminal-session.test.ts
- bundle
- ComputerManager
- CopilotClientLike
- ProviderSessionService
- TmuxTerminalSessionController
- lib.rs
- TerminalSessionController
- shell.ts
- background-task-adapter.ts
- config.rs
- SessionService
- terminal-session.ts
- session-resource-clear.test.ts
- pwa.ts
- devDependencies
- FakeSessionService
- dependencies
- agentic-remote
- hub-routes.ts
- WorkspaceDialog
- session-knowledge-routes.test.ts
- knowledge-tree.ts
- agentic-remote-promotion-setup
- delegated-transcription-service.ts
- node-routes.ts
- recordValue
- scripts
- directory-browser.ts
- PushNotificationService
- app.ts
- compilerOptions
- active-sessions.ts
- BackgroundTasksDialog.tsx
- tmux-errors.integration.test.ts
- transcription-service.ts
- ComputerSummary
- NewSessionDialog
- capture-workspace.ts
- .sendInternal
- compilerOptions
- session-store-providers.test.ts
- compilerOptions
- check-workspace-review-regressions.ts
- compilerOptions
- recordValue
- event-log.ts
- workspace-browser.ts
- NodeIdentityStore
- session-reply-durability.test.ts
- use-session-knowledge-root.ts
- ReaderWorkspace
- agent-service.test.ts
- background-task-stop.test.ts
- recovery-resend-durability.test.ts
- session-resource-routes.test.ts
- capture
- PromptCards.tsx
- workspace-fixtures.ts
- desktop.json
- capture-workbench-review.ts
- package.json
- .oxlintrc.json
- settings-local.json
- push-notification-service.ts
- TranscriptionError
- session-response-order.ts
- promotion-monitor.test.ts
- SessionAdmissions
- html-preview.ts
- scripts
- .createSession
- session-clear-transcript.test.ts
- DeferredSession
- bridge.rs
- setupWorkspaceFixture
- screenshot-stability.test.ts
- remote-node-client.test.ts
- submission-error.ts
- session-resource-transport.ts
- session-store-durability.test.ts
- KnowledgePosition
- SessionFileUpload
- DocumentViewControls.tsx
- settings.ts
- composer-layout.test.ts
- release-publication.test.ts
- session-navigation-view.test.ts
- SessionRuntimeInfo
- KnowledgeRootChoices.test.tsx
- MarkdownCodeBlock.tsx
- .discoverTerminalSessions
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
- agentic-remote-shell

## God Nodes (most connected - your core abstractions)
1. `SessionDetail` - 259 edges
2. `App()` - 224 edges
3. `AgentService` - 202 edges
4. `SessionStore` - 139 edges
5. `ClaudeAgentService` - 117 edges
6. `ComputerManager` - 78 edges
7. `SessionService` - 69 edges
8. `RemoteNodeClient` - 64 edges
9. `registerHubRoutes()` - 58 edges
10. `ProviderSessionService` - 53 edges

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

## Communities (134 total, 21 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.05
Nodes (7): agentMode(), AgentService, isUncertainDelivery(), queueConflict(), fixture(), httpBoundary(), TranscriptObservation

### Community 1 - "SessionDetail"
Cohesion: 0.04
Nodes (46): fixture(), connect(), createStore(), deferred(), disk, enqueue(), fixture(), fixtures (+38 more)

### Community 2 - "App"
Cohesion: 0.04
Nodes (117): activeComposerPastes(), App(), appendComposerForKey(), appKeyDown(), applyComputerSnapshot(), applySession(), askAboutKnowledgeFile(), attachedFiles() (+109 more)

### Community 3 - "api.ts"
Cohesion: 0.04
Nodes (103): parseSubmissionReceipt(), submissionReceiptFromError(), addKnowledgeRoot(), cancelBackgroundTask(), cancelSession(), clearConversation(), configureRuntime(), definiteDispatchRefusals (+95 more)

### Community 4 - "App.tsx"
Cohesion: 0.03
Nodes (94): accentIconUrl(), applyAccentIcon(), addComputer(), removeComputer(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage() (+86 more)

### Community 5 - "contracts.ts"
Cohesion: 0.04
Nodes (42): RemoteResync, RemoteSessionRead, RegistryState, StoredNodeIdentity, DEFINITE_DISPATCH_REFUSALS, headerSafe(), normalizeNodeUrl(), REDIRECT_STATUSES (+34 more)

### Community 6 - "ClaudeAgentService"
Cohesion: 0.06
Nodes (5): ClaudeAgentService, isMissingClaudeSessionError(), copilotRequest(), QueuedPromptReservation, RuntimeModelOption

### Community 7 - "session-resources.ts"
Cohesion: 0.07
Nodes (52): ActiveClaudeQuery, ClaudeResources, RemoteNodeRedirectError, releases, session, snapshot, claudeMcp(), claudeSkillNames() (+44 more)

### Community 8 - "SessionKnowledgeStore"
Cohesion: 0.06
Nodes (38): Lineage, registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession() (+30 more)

### Community 9 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (67): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+59 more)

### Community 10 - "queued-dispatch.test.ts"
Cohesion: 0.06
Nodes (30): CopilotSessionLike, CopilotTasksApi, acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight() (+22 more)

### Community 11 - "session-presentation.ts"
Cohesion: 0.07
Nodes (46): react, DialogFrame(), KnowledgeRootChoice, KnowledgeRootChoices(), KnowledgeRootSession, KnowledgeRootSelector(), root, SessionFilter (+38 more)

### Community 12 - "claude-agent-service.ts"
Cohesion: 0.06
Nodes (27): AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission, PendingClaudeReply (+19 more)

### Community 13 - "agent-service.ts"
Cohesion: 0.05
Nodes (46): AcceptedSdkReply, ActivePrompt, activityDuration(), ActivityToolStart, AgentServiceEvents, ansiSequence, commandShortcut(), CreationRuntime (+38 more)

### Community 14 - "terminal-session.test.ts"
Cohesion: 0.08
Nodes (36): directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), directories, exec, parseTerminalUpdateNotice() (+28 more)

### Community 15 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 16 - "ComputerManager"
Cohesion: 0.19
Nodes (7): ComputerManager, managedSession(), RemoteSessionListing, registerHubRoutes(), ManagedRemovedQueuedPrompt, ManagedSession, SessionListing

### Community 17 - "CopilotClientLike"
Cohesion: 0.06
Nodes (21): CopilotClientLike, isMissingSessionError(), holdProbe(), fixtures, gate(), releases, deferred(), disk (+13 more)

### Community 19 - "TmuxTerminalSessionController"
Cohesion: 0.12
Nodes (11): capturePane(), copilotCommand(), execFileAsync, processAncestors(), processCommand(), processIsAlive(), submitTerminalForm(), terminalChecklistState() (+3 more)

### Community 20 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 21 - "TerminalSessionController"
Cohesion: 0.08
Nodes (6): isForegroundCompletionEvent(), isForegroundLifecycleEvent(), statusFromEvents(), TerminalSessionController, PendingPermission, PendingUserInput

### Community 22 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 23 - "background-task-adapter.ts"
Cohesion: 0.13
Nodes (37): addActivity(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), boundedText(), CopilotTaskInfo, CopilotTaskProgress, errorValue(), eventTask() (+29 more)

### Community 24 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 26 - "terminal-session.ts"
Cohesion: 0.10
Nodes (34): composer(), processAdapter, COMPOSER_PLACEHOLDERS, composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), hasComposerAfter() (+26 more)

### Community 27 - "session-resource-clear.test.ts"
Cohesion: 0.08
Nodes (31): ClaudeSdk, directories, fixture(), queryHandle(), waitForIdle(), apps, directories, directory() (+23 more)

### Community 28 - "pwa.ts"
Cohesion: 0.11
Nodes (32): getProviderRuntimeOptions(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate(), toggle() (+24 more)

### Community 29 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 30 - "FakeSessionService"
Cohesion: 0.09
Nodes (4): FakeSessionService, routingFixture(), session(), temporaryDirectory()

### Community 31 - "dependencies"
Cohesion: 0.06
Nodes (33): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/static, @fastify/websocket, ffmpeg-static (+25 more)

### Community 32 - "agentic-remote"
Cohesion: 0.14
Nodes (30): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+22 more)

### Community 33 - "hub-routes.ts"
Cohesion: 0.07
Nodes (28): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+20 more)

### Community 34 - "WorkspaceDialog"
Cohesion: 0.13
Nodes (29): followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), MarkdownImage(), missingDocumentFragment(), WorkspaceDialog(), moveHere(), navigateDocument() (+21 more)

### Community 35 - "session-knowledge-routes.test.ts"
Cohesion: 0.10
Nodes (16): WorkspaceFixtureState, ServerRole, SessionMetadataLookup, KnowledgeState, KnowledgeStore, directories, disk, FakeManager (+8 more)

### Community 36 - "knowledge-tree.ts"
Cohesion: 0.11
Nodes (28): WorkspaceEntry, listKnowledgeEntries(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeTreeKeyDown(), loadKnowledgeChain() (+20 more)

### Community 37 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (28): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+20 more)

### Community 38 - "delegated-transcription-service.ts"
Cohesion: 0.11
Nodes (14): BuildAppOptions, collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation (+6 more)

### Community 39 - "node-routes.ts"
Cohesion: 0.08
Nodes (24): MAX_SESSION_FILE_BYTES, SessionParams, supportedExtensions, supportsSessionFile(), AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, configureRuntimeSchema, createSessionSchema (+16 more)

### Community 40 - "recordValue"
Cohesion: 0.16
Nodes (24): activityGroupIdFor(), activityKind(), activityResult(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), isActivityGroupKind() (+16 more)

### Community 41 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 42 - "directory-browser.ts"
Cohesion: 0.17
Nodes (13): DirectoryScope, displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin() (+5 more)

### Community 43 - "PushNotificationService"
Cohesion: 0.19
Nodes (3): HubEventSource, PushNotificationService, registerPushRoutes()

### Community 44 - "app.ts"
Cohesion: 0.13
Nodes (16): prefixes, session, trusted, untrusted, directories, buildApp(), errorStatusCode(), transcriptionComputerName() (+8 more)

### Community 45 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 46 - "active-sessions.ts"
Cohesion: 0.19
Nodes (23): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+15 more)

### Community 47 - "BackgroundTasksDialog.tsx"
Cohesion: 0.14
Nodes (15): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask, BackgroundTaskCard(), BackgroundTasksDialog() (+7 more)

### Community 48 - "tmux-errors.integration.test.ts"
Cohesion: 0.12
Nodes (19): execFileAsync, headers, ignoreMissing(), removeFixture(), seedSession(), sessionLog(), stopOwnedServer(), noTmuxServer() (+11 more)

### Community 49 - "transcription-service.ts"
Cohesion: 0.11
Nodes (19): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+11 more)

### Community 50 - "ComputerSummary"
Cohesion: 0.16
Nodes (5): fixture(), session(), sessionAtLeastAsNew(), RegisteredComputer, ComputerSummary

### Community 51 - "NewSessionDialog"
Cohesion: 0.15
Nodes (22): activateSession(), createSession(), executeCommand(), listDirectories(), listHistory(), listWorkspace(), validateSessionDirectory(), AddKnowledgeRootDialog() (+14 more)

### Community 52 - "capture-workspace.ts"
Cohesion: 0.20
Nodes (20): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+12 more)

### Community 53 - ".sendInternal"
Cohesion: 0.30
Nodes (20): activeBottomFrame(), cleanDialogLine(), clearAutomaticStartupPrompts(), containsCopiedInteractiveFrame(), desktopInstallPromptIdentity(), findTerminalWrappedText(), hasTerminalCommandPermissionQuestion(), isTerminalAgentWorking() (+12 more)

### Community 54 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 55 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (9): claude(), clearFixture(), copilot(), disk, event(), fixtures, holdOtherWrite(), releases (+1 more)

### Community 56 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 57 - "check-workspace-review-regressions.ts"
Cohesion: 0.13
Nodes (15): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+7 more)

### Community 58 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 59 - "recordValue"
Cohesion: 0.18
Nodes (19): attachmentModeValue(), backgroundHandoff(), booleanValue(), eventString(), lastForegroundCompletionAt(), normalizedToolName(), notificationKind(), parsedValue() (+11 more)

### Community 60 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 61 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 62 - "NodeIdentityStore"
Cohesion: 0.18
Nodes (4): ComputerRegistry, directories, remoteSnapshotFixture(), NodeIdentityStore

### Community 63 - "session-reply-durability.test.ts"
Cohesion: 0.18
Nodes (14): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRunFixture() (+6 more)

### Community 64 - "use-session-knowledge-root.ts"
Cohesion: 0.21
Nodes (12): getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey(), knowledgePositionForBinding(), SessionIdentity (+4 more)

### Community 65 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 66 - "agent-service.test.ts"
Cohesion: 0.15
Nodes (7): terminalFormSteps(), configurableModel(), directories, FakeCopilotClient, services, startupFifoFixture(), UserInputForm

### Community 67 - "background-task-stop.test.ts"
Cohesion: 0.21
Nodes (13): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), snapshot() (+5 more)

### Community 68 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 69 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 70 - "capture"
Cohesion: 0.18
Nodes (15): releaseRecording(), shortcutKeys(), startRecording(), stopRecording(), binding(), bindingLabel(), capturableCode(), isModifierCode() (+7 more)

### Community 71 - "PromptCards.tsx"
Cohesion: 0.24
Nodes (14): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), UserInputCard(), UserInputFieldControl(), chooseOption(), handleMenuKeyDown() (+6 more)

### Community 72 - "workspace-fixtures.ts"
Cohesion: 0.15
Nodes (13): documents, FIXTURE_NOW, fixtureBackgroundTasks, fixtureEndpoints, fixtureKnowledgeListings, fixtureKnowledgePositions, fixtureModels, PERMISSION_SESSION_ID (+5 more)

### Community 73 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 74 - "capture-workbench-review.ts"
Cohesion: 0.17
Nodes (10): frame(), geometry, output, scratch, screenshot(), { values }, fixtureSessions, IDLE_SESSION_ID (+2 more)

### Community 75 - "package.json"
Cohesion: 0.15
Nodes (11): directory, { values }, workflows, name, packageManager, pnpm, onlyBuiltDependencies, private (+3 more)

### Community 76 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 77 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 78 - "push-notification-service.ts"
Cohesion: 0.15
Nodes (10): brief(), PushSender, PushState, directories, RFC-8030, RFC-8030, sessionMuteSchema, subscriptionSchema (+2 more)

### Community 79 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 80 - "session-response-order.ts"
Cohesion: 0.27
Nodes (11): sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), currentSessionEventSequence(), nextSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences (+3 more)

### Community 81 - "promotion-monitor.test.ts"
Cohesion: 0.30
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 82 - "SessionAdmissions"
Cohesion: 0.20
Nodes (4): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions

### Community 83 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 84 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, check, dev, dev:server, dev:web, lint, start (+3 more)

### Community 86 - "session-clear-transcript.test.ts"
Cohesion: 0.22
Nodes (5): disk, fixtures, gate(), holdTurnWrite(), releases

### Community 88 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 89 - "setupWorkspaceFixture"
Cohesion: 0.25
Nodes (6): pageFor(), createWorkspaceFixtureState(), fixtureBaseUrl(), fixtureValue(), setupWorkspaceFixture(), fixtureApi()

### Community 90 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 91 - "remote-node-client.test.ts"
Cohesion: 0.28
Nodes (5): client(), servers, session, TERMINAL_REQUEST_TIMEOUT_MS, TERMINAL_STARTUP_TIMEOUT_MS

### Community 92 - "submission-error.ts"
Cohesion: 0.39
Nodes (5): RemoteNodeRequestError, httpDeliveryUncertain(), legacyDefinitiveHttpRefusals, SubmissionError, SubmissionReceipt

### Community 93 - "session-resource-transport.ts"
Cohesion: 0.36
Nodes (7): readClaudeMcp(), readCopilotResource(), copilotTransport(), disposals, Frame, write(), unavailable()

### Community 94 - "session-store-durability.test.ts"
Cohesion: 0.31
Nodes (7): disk, fixture(), fixtures, prompt(), ready(), releases, session()

### Community 95 - "KnowledgePosition"
Cohesion: 0.36
Nodes (4): WorkspaceFixtureOptions, KnowledgePosition, KnowledgeRestoreState, base

### Community 97 - "DocumentViewControls.tsx"
Cohesion: 0.29
Nodes (4): DocumentViewControls(), actions, outline, DocumentHeading

### Community 98 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 99 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 100 - "release-publication.test.ts"
Cohesion: 0.40
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 101 - "session-navigation-view.test.ts"
Cohesion: 0.33
Nodes (5): computers, first, grouped, hidden, last

### Community 102 - "SessionRuntimeInfo"
Cohesion: 0.50
Nodes (3): listTmuxSessions(), safeWindowName(), SessionRuntimeInfo

### Community 103 - "KnowledgeRootChoices.test.tsx"
Cohesion: 0.40
Nodes (4): actions, computers, root, session

### Community 108 - "MermaidDiagram.tsx"
Cohesion: 0.67
Nodes (3): drawDiagram(), drawing, MermaidDiagram()

## Knowledge Gaps
- **618 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+613 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 929 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `RemoteNodeClient` connect `contracts.ts` to `SessionFileUpload`, `ComputerSummary`, `claude-agent-service.ts`, `directory-browser.ts`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `AgentService` connect `AgentService` to `SessionFileUpload`, `SessionDetail`, `session-resources.ts`, `recordValue`, `queued-dispatch.test.ts`, `.discoverTerminalSessions`, `directory-browser.ts`, `claude-agent-service.ts`, `CopilotClientLike`, `.createSession`, `TerminalSessionController`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionDetail` to `AgentService`, `SessionFileUpload`, `TerminalSessionController`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _618 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.052950910093767234 - nodes in this community are weakly interconnected._
- **Should `SessionDetail` be split into smaller, more focused modules?**
  _Cohesion score 0.039613960273818874 - nodes in this community are weakly interconnected._
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
