# Agentic Remote - Graphify code map

Snapshot: `e89b29a8daa8930191f2478c38f64338d8ce1550d2dc5cb1ff2e973635de0082`

Source checkout: `89634639969db3faf569ec404fe12ba7d1bcca73`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 227 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 227 files · ~457,356 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3455 nodes · 9736 edges · 145 communities (111 shown, 20 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 722 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- api.ts
- App
- App.tsx
- ClaudeAgentService
- SessionStore
- app.ts
- .readAfterWrites
- contracts.ts
- agentic-remote-promotion-monitor
- RemoteNodeClient
- AgentService
- ComputerManager
- BackgroundTaskSnapshot
- markdown-navigation.ts
- SessionDetail
- queued-dispatch.ts
- terminal-session.ts
- computer-manager.ts
- TmuxTerminalSessionController
- bundle
- agent-service.ts
- .get
- ProviderSessionService
- node-routes.ts
- lib.rs
- shell.ts
- workspace-fixtures.ts
- config.rs
- knowledge-tree.ts
- tmux-errors.integration.test.ts
- pwa.ts
- background-task-adapter.ts
- hub-routes.ts
- devDependencies
- FakeSessionService
- SessionService
- dependencies
- agentic-remote
- tmux-test-helpers.ts
- active-sessions.ts
- agentic-remote-promotion-setup
- SessionKnowledgeStore
- session-resources.ts
- terminal-session.test.ts
- react
- CopilotSessionLike
- SessionResources.tsx
- scripts
- .handleSessionEvent
- compilerOptions
- SessionOrderStore
- AppSettingsDialog
- session-knowledge-store.ts
- session-store-providers.test.ts
- capture-workspace.ts
- compilerOptions
- session-store.ts
- PushNotificationService
- compilerOptions
- compilerOptions
- SessionSkillsSnapshot
- recordValue
- event-log.ts
- workspace-browser.ts
- SessionKnowledgeBinding
- normalizeKnowledgeRelativePath
- session-clear-transcript.test.ts
- session-reply-durability.test.ts
- HubEvent
- directory-browser.ts
- ReaderWorkspace
- background-task-stop.test.ts
- recovery-resend-durability.test.ts
- session-resource-routes.test.ts
- queued-dispatch.test.ts
- desktop.json
- registerSessionKnowledgeRoutes
- capture-workbench-review.ts
- package.json
- settings-local.json
- queued-provider-dispatch.test.ts
- session-knowledge-routes.ts
- session-resource-providers.test.ts
- scripts
- SessionMcpServersSnapshot
- background-task-tracker.ts
- promotion-monitor.test.ts
- recovery-seed-guards.test.ts
- SessionAdmissions
- session-resource-clear.test.ts
- BackgroundTasksDialog.tsx
- html-preview.ts
- claude-agent-service.ts
- session-enqueue-clear.test.ts
- composerHoldsText
- .oxlintrc.json
- DeferredSession
- claude-agent-service.test.ts
- claude-recovery-admission.test.ts
- session-resource-transport.ts
- terminal-startup-queue.test.ts
- bridge.rs
- screenshot-stability.test.ts
- KnowledgePosition
- agent-service.test.ts
- session-admission-lifecycle.test.ts
- tmux-errors.test.ts
- generate-pwa-icons.ts
- safeResourceError
- UserInputFieldControl
- recovery-context.ts
- settings.ts
- toolActivityContent
- composer-layout.test.ts
- release-publication.test.ts
- push-routes.ts
- terminal-send-uncertainty.test.ts
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

## Communities (145 total, 20 thin omitted)

### Community 0 - "api.ts"
Cohesion: 0.03
Nodes (111): RemoteNodeRedirectError, RemoteNodeRequestError, AddKnowledgeRootInput, PushSettings, httpDeliveryUncertain(), legacyDefinitiveHttpRefusals, parseSubmissionReceipt(), SubmissionError (+103 more)

### Community 1 - "App"
Cohesion: 0.04
Nodes (123): saveSessionOrderLane(), activeComposerPastes(), App(), adoptConversationReplacement(), appendComposerForKey(), appKeyDown(), applyComputerSnapshot(), applySession() (+115 more)

### Community 2 - "App.tsx"
Cohesion: 0.03
Nodes (109): AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph(), activityStatusLabel() (+101 more)

### Community 3 - "ClaudeAgentService"
Cohesion: 0.05
Nodes (6): ClaudeAgentService, isMissingClaudeSessionError(), answer(), claudeRequest(), copilotRequest(), RuntimeModelOption

### Community 4 - "SessionStore"
Cohesion: 0.06
Nodes (27): fixture(), createStore(), recoveryFixture(), fixture(), copilotFixture(), fixture(), fixture(), fixture() (+19 more)

### Community 5 - "app.ts"
Cohesion: 0.05
Nodes (48): prefixes, session, trusted, untrusted, buildApp(), BuildAppOptions, errorStatusCode(), ServerRole (+40 more)

### Community 6 - ".readAfterWrites"
Cohesion: 0.07
Nodes (4): isUncertainDelivery(), queueConflict(), TerminalSessionController, deliveryUncertaintyFromError()

### Community 7 - "contracts.ts"
Cohesion: 0.05
Nodes (38): AgentServiceEvents, CreationRuntime, ClaudeAgentServiceEvents, DirectoryScope, directories, routingFixture(), session(), temporaryDirectory() (+30 more)

### Community 8 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (67): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+59 more)

### Community 9 - "RemoteNodeClient"
Cohesion: 0.04
Nodes (24): RemoteResync, RemoteSessionRead, AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, DEFINITE_DISPATCH_REFUSALS, headerSafe(), normalizeNodeUrl(), REDIRECT_STATUSES (+16 more)

### Community 10 - "AgentService"
Cohesion: 0.07
Nodes (4): AgentService, RuntimeConfigurationError, fixture(), httpBoundary()

### Community 11 - "ComputerManager"
Cohesion: 0.13
Nodes (8): ComputerManager, managedSession(), sessionAtLeastAsNew(), RegisteredComputer, registerHubRoutes(), ComputerSummary, ManagedRemovedQueuedPrompt, ManagedSession

### Community 12 - "BackgroundTaskSnapshot"
Cohesion: 0.07
Nodes (46): hasRunningBackgroundAgent(), BackgroundTaskSnapshot, KnowledgeRootSelector(), root, SessionFilter, sessionNavigationView, computers, first (+38 more)

### Community 13 - "markdown-navigation.ts"
Cohesion: 0.07
Nodes (47): UserInputField, UserInputFieldValue, executeCommand(), listWorkspace(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink() (+39 more)

### Community 14 - "SessionDetail"
Cohesion: 0.10
Nodes (4): persistedFormAnswer(), validateUserInputForm(), SessionDetail, UserInputReplyInput

### Community 15 - "queued-dispatch.ts"
Cohesion: 0.07
Nodes (20): acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight(), preparePrompt(), QueuedDelivery (+12 more)

### Community 16 - "terminal-session.ts"
Cohesion: 0.11
Nodes (47): activeBottomFrame(), cleanDialogLine(), clearAutomaticStartupPrompts(), COMPOSER_PLACEHOLDERS, containsCopiedInteractiveFrame(), desktopInstallPromptIdentity(), findTerminalWrappedText(), FormViewport (+39 more)

### Community 17 - "computer-manager.ts"
Cohesion: 0.07
Nodes (26): fixture(), managers, releases, remote, session(), RemoteSessionListing, SessionMetadataLookup, ComputerRegistry (+18 more)

### Community 18 - "TmuxTerminalSessionController"
Cohesion: 0.11
Nodes (12): capturePane(), copilotCommand(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand(), safeWindowName(), tmuxTargetForPid() (+4 more)

### Community 19 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 20 - "agent-service.ts"
Cohesion: 0.05
Nodes (38): AcceptedSdkReply, ActivePrompt, activityDuration(), ActivityToolStart, ansiSequence, commandShortcut(), DeliveryBoundary, ElicitationContext (+30 more)

### Community 21 - ".get"
Cohesion: 0.09
Nodes (7): agentMode(), isForegroundCompletionEvent(), isForegroundLifecycleEvent(), isMissingSessionError(), removeCopilotSessionFiles(), statusFromEvents(), TranscriptObservation

### Community 23 - "node-routes.ts"
Cohesion: 0.06
Nodes (28): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile(), configureRuntimeSchema, createSessionSchema (+20 more)

### Community 24 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 25 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 26 - "workspace-fixtures.ts"
Cohesion: 0.08
Nodes (31): pageFor(), accents, Measurement, originalDocument, output, report, save(), scratch (+23 more)

### Community 27 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 28 - "knowledge-tree.ts"
Cohesion: 0.09
Nodes (34): WorkspaceEntry, listKnowledgeEntries(), readKnowledgeFile(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor() (+26 more)

### Community 29 - "tmux-errors.integration.test.ts"
Cohesion: 0.09
Nodes (17): WorkspaceFixtureState, SessionMuteCarrier, KnowledgeState, KnowledgeStore, directories, fixture(), directories, fakeManager() (+9 more)

### Community 30 - "pwa.ts"
Cohesion: 0.11
Nodes (30): directories, AppVersion, parseAppVersion(), deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), checkForUpdate() (+22 more)

### Community 31 - "background-task-adapter.ts"
Cohesion: 0.15
Nodes (34): addActivity(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), boundedText(), CopilotTaskInfo, CopilotTaskProgress, errorValue(), eventTask() (+26 more)

### Community 32 - "hub-routes.ts"
Cohesion: 0.06
Nodes (35): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+27 more)

### Community 33 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 36 - "dependencies"
Cohesion: 0.06
Nodes (33): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, @fastify/multipart, @fastify/static, @fastify/websocket, ffmpeg-static (+25 more)

### Community 37 - "agentic-remote"
Cohesion: 0.14
Nodes (30): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+22 more)

### Community 38 - "tmux-test-helpers.ts"
Cohesion: 0.11
Nodes (24): directories, exec, isTerminalAgentWorking(), noTmuxServer(), processGone(), procVisible(), socketIdentity(), UnixSocket (+16 more)

### Community 39 - "active-sessions.ts"
Cohesion: 0.13
Nodes (28): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+20 more)

### Community 40 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (28): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+20 more)

### Community 41 - "SessionKnowledgeStore"
Cohesion: 0.14
Nodes (8): bindingKey(), SessionKnowledgeRecoveryError, SessionKnowledgeStore, disk, fixture(), fixtures, releases, root()

### Community 42 - "session-resources.ts"
Cohesion: 0.18
Nodes (27): claudeMcp(), claudeSkillNames(), copilotMcp, copilotSkills, copilotWorkspaceMcp, CopilotWorkspaceSkills, count(), enrichClaudeSkills() (+19 more)

### Community 43 - "terminal-session.test.ts"
Cohesion: 0.11
Nodes (23): TerminalFormContinuation, exec, formFixture(), horizontalFormFixture(), isTerminalSessionInUsePrompt(), parseTerminalUpdateNotice(), TerminalFormReplyError, bracketedTabPane (+15 more)

### Community 44 - "react"
Cohesion: 0.09
Nodes (15): plugins, oxc, react, typescript, DialogFrame(), DocumentViewControls(), actions, outline (+7 more)

### Community 45 - "CopilotSessionLike"
Cohesion: 0.08
Nodes (10): CopilotClientLike, CopilotSessionLike, FakeCopilotClient, CopilotTasksApi, fixtures, recoverAndSeed(), releases, boots (+2 more)

### Community 46 - "SessionResources.tsx"
Cohesion: 0.12
Nodes (23): ManagedSessionSkillsSnapshot, SessionMcpServerSummary, SessionResourceSource, SessionSkillSummary, isMcpSummary(), isRecord(), isSkillSummary(), listSessionMcpServers() (+15 more)

### Community 47 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 48 - ".handleSessionEvent"
Cohesion: 0.19
Nodes (22): activityGroupIdFor(), activityKind(), activityResult(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), isBackgroundTaskEvent() (+14 more)

### Community 49 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 50 - "SessionOrderStore"
Cohesion: 0.20
Nodes (9): orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState, SessionOrderStore, directories, store() (+1 more)

### Community 51 - "AppSettingsDialog"
Cohesion: 0.14
Nodes (22): provider(), activateSession(), createSession(), getProviderRuntimeOptions(), listDirectories(), listHistory(), sendTestPushNotification(), validateSessionDirectory() (+14 more)

### Community 52 - "session-knowledge-store.ts"
Cohesion: 0.10
Nodes (20): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+12 more)

### Community 53 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (11): claude(), clearFixture(), copilot(), disk, event(), fixture(), fixtures, holdOtherWrite() (+3 more)

### Community 54 - "capture-workspace.ts"
Cohesion: 0.20
Nodes (20): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+12 more)

### Community 55 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 56 - "session-store.ts"
Cohesion: 0.10
Nodes (16): holdProbe(), fixtures, gate(), releases, archivedMessage(), DiscoveredSession, emptyRetirements, PendingChange (+8 more)

### Community 58 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 59 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 60 - "SessionSkillsSnapshot"
Cohesion: 0.15
Nodes (9): ClaudeResources, releases, session, snapshot, readSessionSkills(), sanitizeSkillsSnapshot(), unavailableSkills(), SessionResourceSnapshot (+1 more)

### Community 61 - "recordValue"
Cohesion: 0.18
Nodes (19): attachmentModeValue(), backgroundHandoff(), booleanValue(), eventString(), lastForegroundCompletionAt(), normalizedToolName(), notificationKind(), parsedValue() (+11 more)

### Community 62 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 63 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 64 - "SessionKnowledgeBinding"
Cohesion: 0.20
Nodes (13): SessionKnowledgeBinding, getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey(), knowledgePositionForBinding() (+5 more)

### Community 65 - "normalizeKnowledgeRelativePath"
Cohesion: 0.22
Nodes (15): joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath(), slashPath(), scopedKnowledgeRoot(), KnowledgeRootChoice (+7 more)

### Community 66 - "session-clear-transcript.test.ts"
Cohesion: 0.12
Nodes (11): disk, fixtures, gate(), holdTurnWrite(), releases, disk, fixtures, prompt() (+3 more)

### Community 67 - "session-reply-durability.test.ts"
Cohesion: 0.18
Nodes (14): assistantFixture(), claudeFixture(), claudeQuestions(), claudeRunFixture(), copilotFixture(), copilotRunFixture(), disk, fallbackFormFixture() (+6 more)

### Community 68 - "HubEvent"
Cohesion: 0.15
Nodes (10): WorkspaceFixture, ComputerManagerEvents, brief(), HubEventSource, PushSender, PushState, directories, RFC-8030 (+2 more)

### Community 69 - "directory-browser.ts"
Cohesion: 0.28
Nodes (11): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin(), SessionDirectoryError (+3 more)

### Community 70 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 71 - "background-task-stop.test.ts"
Cohesion: 0.21
Nodes (13): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), snapshot() (+5 more)

### Community 72 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 73 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 74 - "queued-dispatch.test.ts"
Cohesion: 0.14
Nodes (8): accept(), deferred(), disk, fixtures, holdWrite(), prompt(), releases, target

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

### Community 80 - "queued-provider-dispatch.test.ts"
Cohesion: 0.17
Nodes (7): copilotSession(), fixtures, gate(), originalQueue, pause(), releases, unknownClaim()

### Community 81 - "session-knowledge-routes.ts"
Cohesion: 0.15
Nodes (7): Lineage, RegistrationGeneration, ReplacementEvidence, SessionKnowledgeLifecycle, sessionParams, updateSchema, SessionKnowledgeConflictError

### Community 82 - "session-resource-providers.test.ts"
Cohesion: 0.22
Nodes (12): claudeFixture(), ClaudeMcpRead, deferred(), directory(), DiscoveredMcp, DiscoveredSkills, fixtures, Mcp (+4 more)

### Community 83 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+4 more)

### Community 84 - "SessionMcpServersSnapshot"
Cohesion: 0.24
Nodes (5): isResourceMethodUnavailable(), mcpSnapshot(), messageFor(), skillsSnapshot(), SessionMcpServersSnapshot

### Community 85 - "background-task-tracker.ts"
Cohesion: 0.30
Nodes (6): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 86 - "promotion-monitor.test.ts"
Cohesion: 0.30
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 87 - "recovery-seed-guards.test.ts"
Cohesion: 0.18
Nodes (8): bootLegacy(), directories, execute, pending, releases, SeedState, services, stores

### Community 88 - "SessionAdmissions"
Cohesion: 0.20
Nodes (4): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions

### Community 89 - "session-resource-clear.test.ts"
Cohesion: 0.18
Nodes (11): apps, directories, directory(), obstructUploads(), pairedFixture(), providers, seed(), sockets (+3 more)

### Community 90 - "BackgroundTasksDialog.tsx"
Cohesion: 0.27
Nodes (9): BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive(), taskStatusLabel() (+1 more)

### Community 91 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 92 - "claude-agent-service.ts"
Cohesion: 0.18
Nodes (10): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission, PendingClaudeReply (+2 more)

### Community 93 - "session-enqueue-clear.test.ts"
Cohesion: 0.29
Nodes (10): disk, EnqueueCase, fixture(), fixtures, gate(), holdEnqueue(), joinedEnqueue(), quiet() (+2 more)

### Community 94 - "composerHoldsText"
Cohesion: 0.33
Nodes (11): composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), occurrences(), paneEvidenceCount(), paneShowsText(), pasteCouldCollapse() (+3 more)

### Community 95 - ".oxlintrc.json"
Cohesion: 0.20
Nodes (9): ignorePatterns, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/**, graphify/.venv/** (+1 more)

### Community 97 - "claude-agent-service.test.ts"
Cohesion: 0.22
Nodes (7): ClaudeSdk, cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle()

### Community 98 - "claude-recovery-admission.test.ts"
Cohesion: 0.27
Nodes (8): connect(), deferred(), disk, enqueue(), fixture(), fixtures, holdClaimWrite(), releases

### Community 99 - "session-resource-transport.ts"
Cohesion: 0.31
Nodes (8): CopilotResourceMethod, readClaudeMcp(), readCopilotResource(), copilotTransport(), disposals, Frame, write(), unavailable()

### Community 100 - "terminal-startup-queue.test.ts"
Cohesion: 0.29
Nodes (8): acceptedStartupRecovery(), client(), disk, exec, fixture(), gate(), releases, services

### Community 101 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 102 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 103 - "KnowledgePosition"
Cohesion: 0.33
Nodes (5): WorkspaceFixtureOptions, KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 104 - "agent-service.test.ts"
Cohesion: 0.25
Nodes (6): terminalFormSteps(), configurableModel(), directories, services, startupFifoFixture(), UserInputForm

### Community 105 - "session-admission-lifecycle.test.ts"
Cohesion: 0.25
Nodes (6): deferred(), disk, enqueue(), fixtures, holdAdmissionWrite(), releases

### Community 106 - "tmux-errors.test.ts"
Cohesion: 0.25
Nodes (6): directories, { execute }, files, links, listener(), server()

### Community 107 - "generate-pwa-icons.ts"
Cohesion: 0.36
Nodes (4): renderIcon(), root, root, appIconSvg()

### Community 108 - "safeResourceError"
Cohesion: 0.43
Nodes (4): readServiceResources(), ResourceReads, resourceRequestHandler(), safeResourceError()

### Community 109 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 110 - "recovery-context.ts"
Cohesion: 0.38
Nodes (4): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief

### Community 111 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 112 - "toolActivityContent"
Cohesion: 0.40
Nodes (6): previewText(), readableMcpServerName(), readableToolName(), sameToolLabel(), stripAnsi(), toolActivityContent()

### Community 113 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 114 - "release-publication.test.ts"
Cohesion: 0.40
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 115 - "push-routes.ts"
Cohesion: 0.40
Nodes (4): sessionMuteSchema, subscriptionSchema, testNotificationSchema, unsubscribeSchema

## Knowledge Gaps
- **658 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+653 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 990 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **20 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `SessionStore`, `.readAfterWrites`, `contracts.ts`, `SessionDetail`, `queued-dispatch.ts`, `.handleSessionEvent`, `SessionMcpServersSnapshot`, `.get`, `node-routes.ts`, `SessionSkillsSnapshot`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **Why does `buildApp()` connect `app.ts` to `ClaudeAgentService`, `SessionService`, `SessionStore`, `.readAfterWrites`, `SessionKnowledgeStore`, `AgentService`, `ComputerManager`, `computer-manager.ts`, `SessionOrderStore`, `ProviderSessionService`, `node-routes.ts`, `PushNotificationService`, `tmux-errors.integration.test.ts`, `pwa.ts`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **Why does `connect()` connect `claude-recovery-admission.test.ts` to `ClaudeAgentService`, `SessionStore`, `AgentService`, `.get`, `ProviderSessionService`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _658 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `api.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.031214399635452268 - nodes in this community are weakly interconnected._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.04063417498532002 - nodes in this community are weakly interconnected._
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
