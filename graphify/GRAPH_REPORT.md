# Agentic Remote - Graphify code map

Snapshot: `c8930db34356b3e968a9d4e023851eb26994bec0634d5e4c72d797f468469ddd`

Source checkout: `f9f2d949d888775afd570df220527e8fb3ec9fc5`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 230 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 230 files · ~469,523 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3503 nodes · 9883 edges · 140 communities (100 shown, 25 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 728 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App
- api.ts
- App.tsx
- background-task-adapter.ts
- SessionDetail
- ClaudeAgentService
- agent-service.ts
- contracts.ts
- AgentService
- session-resources.ts
- agentic-remote-promotion-monitor
- session-presentation.ts
- .get
- markdown-navigation.ts
- transcription-service.ts
- CopilotSessionLike
- .create
- ComputerManager
- RemoteNodeClient
- terminal-session.ts
- SessionService
- bundle
- TmuxTerminalSessionController
- ProviderSessionService
- terminal-startup-queue.test.ts
- lib.rs
- workspace-fixtures.ts
- FakeSessionService
- config.rs
- hub-routes.ts
- pwa.ts
- devDependencies
- .clearSerialized
- knowledge-tree.ts
- agentic-remote
- dependencies
- app.ts
- agentic-remote-promotion-setup
- session-store.ts
- KnowledgeStore
- SessionOrderStore
- tmux-errors.integration.test.ts
- remote-node-client.ts
- claude-agent-service.ts
- session-reply-durability.test.ts
- session-resource-clear.test.ts
- .sendInternal
- scripts
- shell.ts
- .publish
- compilerOptions
- active-sessions.ts
- .replyUserInputInternal
- node-routes.ts
- capture-workspace.ts
- HubEvent
- ComputerSummary
- session-knowledge-store.ts
- session-store-providers.test.ts
- terminal-session.test.ts
- SessionKnowledgeStore
- workspace-browser.ts
- NewSessionDialog
- compilerOptions
- PushNotificationService
- compilerOptions
- compilerOptions
- session-resource-routes.test.ts
- NodeIdentityStore
- session-admission-lifecycle.test.ts
- event-log.ts
- CopilotClientLike
- use-session-knowledge-root.ts
- ReaderWorkspace
- recovery-resend-durability.test.ts
- queued-provider-dispatch.test.ts
- check-workspace-review-regressions.ts
- desktop.json
- registerSessionKnowledgeRoutes
- normalizeKnowledgeRelativePath
- package.json
- settings-local.json
- SessionKnowledgeBinding
- shell-notifications.ts
- scripts
- session-knowledge-routes.test.ts
- promotion-monitor.test.ts
- recovery-seed-guards.test.ts
- SessionAdmissions
- html-preview.ts
- session-knowledge-routes.ts
- .oxlintrc.json
- generate-pwa-icons.ts
- DeferredSession
- bridge.rs
- screenshot-stability.test.ts
- session-resource-transport.ts
- KnowledgePosition
- SessionFileUpload
- release-publication.test.ts
- recovery-context.ts
- settings.ts
- composer-layout.test.ts
- .persist
- MarkdownCodeBlock.tsx
- hasRunningBackgroundAgent
- removeComputer
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
2. `App()` - 245 edges
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

## Communities (140 total, 25 thin omitted)

### Community 0 - "App"
Cohesion: 0.04
Nodes (123): submissionReceiptFromError(), activeComposerPastes(), App(), adoptConversationReplacement(), appendComposerForKey(), appKeyDown(), applyComputerSnapshot(), applySession() (+115 more)

### Community 1 - "api.ts"
Cohesion: 0.03
Nodes (113): parseSubmissionReceipt(), addKnowledgeRoot(), bootstrapSessionOrder(), cancelBackgroundTask(), cancelSession(), clearConversation(), configureRuntime(), definiteDispatchRefusals (+105 more)

### Community 2 - "App.tsx"
Cohesion: 0.03
Nodes (109): AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph(), activityStatusLabel() (+101 more)

### Community 3 - "background-task-adapter.ts"
Cohesion: 0.05
Nodes (82): addActivity(), attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), boundedText(), errorValue() (+74 more)

### Community 4 - "SessionDetail"
Cohesion: 0.07
Nodes (11): observe(), clearRecoverySeedFailure(), cloneSession(), ownsRecoverySeedFailure(), SessionStore, StoredSession, acceptedStartupRecovery(), ChatMessage (+3 more)

### Community 5 - "ClaudeAgentService"
Cohesion: 0.06
Nodes (5): ClaudeAgentService, isMissingClaudeSessionError(), claudeFixture(), QueuedPromptReservation, RuntimeModelOption

### Community 6 - "agent-service.ts"
Cohesion: 0.05
Nodes (72): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, AgentServiceEvents (+64 more)

### Community 7 - "contracts.ts"
Cohesion: 0.05
Nodes (48): ClaudeAgentServiceEvents, managers, releases, remote, RegistryState, DirectoryScope, directories, routingFixture() (+40 more)

### Community 8 - "AgentService"
Cohesion: 0.06
Nodes (7): agentMode(), AgentService, normalizedTitle(), RuntimeConfigurationError, TerminalDiscoveryError, fixture(), httpBoundary()

### Community 9 - "session-resources.ts"
Cohesion: 0.08
Nodes (47): ClaudeResources, releases, session, snapshot, claudeMcp(), claudeSkillNames(), copilotMcp, copilotSkills (+39 more)

### Community 10 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (67): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+59 more)

### Community 11 - "session-presentation.ts"
Cohesion: 0.06
Nodes (55): plugins, oxc, react, typescript, saveSessionOrderLane(), handleDragEnd(), KnowledgeRootSelector(), root (+47 more)

### Community 12 - ".get"
Cohesion: 0.10
Nodes (4): isUncertainDelivery(), queueConflict(), TerminalSendOptions, deliveryUncertaintyFromError()

### Community 13 - "markdown-navigation.ts"
Cohesion: 0.06
Nodes (54): UserInputField, UserInputFieldValue, followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), MarkdownImage(), missingDocumentFragment(), WorkspaceDialog() (+46 more)

### Community 14 - "transcription-service.ts"
Cohesion: 0.06
Nodes (35): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, registerTranscriptionRoutes() (+27 more)

### Community 15 - "CopilotSessionLike"
Cohesion: 0.06
Nodes (28): CopilotSessionLike, configurableModel(), FakeCopilotClient, startupFifoFixture(), CopilotTasksApi, acceptanceReceipt(), errorMessage(), explicitlyRefused() (+20 more)

### Community 16 - ".create"
Cohesion: 0.06
Nodes (42): fixture(), connect(), createStore(), deferred(), disk, enqueue(), fixture(), fixtures (+34 more)

### Community 17 - "ComputerManager"
Cohesion: 0.16
Nodes (7): ComputerManager, managedSession(), RemoteSessionListing, registerHubRoutes(), ManagedRemovedQueuedPrompt, ManagedSession, SessionListing

### Community 18 - "RemoteNodeClient"
Cohesion: 0.06
Nodes (10): RemoteResync, RemoteSessionRead, RemoteNodeClient, BackgroundTaskSnapshot, NodeInfo, RemovedQueuedPrompt, WorkspaceFile, WorkspaceListing (+2 more)

### Community 19 - "terminal-session.ts"
Cohesion: 0.10
Nodes (46): activeBottomFrame(), boxedComposerFrame(), cleanDialogLine(), clearAutomaticStartupPrompts(), COMPOSER_PLACEHOLDERS, composerFrameText(), containsCopiedInteractiveFrame(), desktopInstallPromptIdentity() (+38 more)

### Community 20 - "SessionService"
Cohesion: 0.08
Nodes (6): ActiveClaudeQuery, registerNodeRoutes(), readServiceResources(), ResourceReads, resourceRequestHandler(), SessionService

### Community 21 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 22 - "TmuxTerminalSessionController"
Cohesion: 0.13
Nodes (11): copilotCommand(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand(), safeWindowName(), submitTerminalForm(), tmuxTargetForPid() (+3 more)

### Community 24 - "terminal-startup-queue.test.ts"
Cohesion: 0.10
Nodes (32): directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), exec, formFixture(), horizontalFormFixture() (+24 more)

### Community 25 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 26 - "workspace-fixtures.ts"
Cohesion: 0.08
Nodes (30): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, createWorkspaceFixtureState() (+22 more)

### Community 28 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 29 - "hub-routes.ts"
Cohesion: 0.06
Nodes (36): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+28 more)

### Community 30 - "pwa.ts"
Cohesion: 0.11
Nodes (33): getProviderRuntimeOptions(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate(), toggle() (+25 more)

### Community 31 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 32 - ".clearSerialized"
Cohesion: 0.11
Nodes (4): isMissingSessionError(), isRuntimeReasoningEffort(), permissionTitle(), removeCopilotSessionFiles()

### Community 33 - "knowledge-tree.ts"
Cohesion: 0.10
Nodes (32): listKnowledgeEntries(), readKnowledgeFile(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor(), knowledgeTreeKeyDown() (+24 more)

### Community 34 - "agentic-remote"
Cohesion: 0.13
Nodes (31): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+23 more)

### Community 35 - "dependencies"
Cohesion: 0.06
Nodes (33): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, @fastify/multipart, @fastify/static, @fastify/websocket, ffmpeg-static (+25 more)

### Community 36 - "app.ts"
Cohesion: 0.10
Nodes (21): prefixes, session, trusted, untrusted, directories, buildApp(), errorStatusCode(), isAppleTouchIconProbe() (+13 more)

### Community 37 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (30): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+22 more)

### Community 38 - "session-store.ts"
Cohesion: 0.06
Nodes (23): holdProbe(), fixtures, gate(), releases, channels, directories, activityDuration(), activityResultPreview() (+15 more)

### Community 39 - "KnowledgeStore"
Cohesion: 0.13
Nodes (8): SessionMuteCarrier, KnowledgeRootReservation, KnowledgeState, KnowledgeStore, directories, fixture(), createHub(), KnowledgeRoot

### Community 40 - "SessionOrderStore"
Cohesion: 0.15
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 41 - "tmux-errors.integration.test.ts"
Cohesion: 0.09
Nodes (21): execFileAsync, headers, ignoreMissing(), removeFixture(), seedSession(), sessionLog(), stopOwnedServer(), noTmuxServer() (+13 more)

### Community 42 - "remote-node-client.ts"
Cohesion: 0.11
Nodes (17): DEFINITE_DISPATCH_REFUSALS, headerSafe(), normalizeNodeUrl(), REDIRECT_STATUSES, client(), servers, session, RemoteNodeRedirectError (+9 more)

### Community 43 - "claude-agent-service.ts"
Cohesion: 0.14
Nodes (19): AuthStatusRunner, ClaudeQuestion, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission, PendingClaudeReply, toolResultText() (+11 more)

### Community 44 - "session-reply-durability.test.ts"
Cohesion: 0.13
Nodes (17): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRequest() (+9 more)

### Community 45 - "session-resource-clear.test.ts"
Cohesion: 0.09
Nodes (25): apps, directories, directory(), obstructUploads(), pairedFixture(), providerFixture(), providers, seed() (+17 more)

### Community 46 - ".sendInternal"
Cohesion: 0.19
Nodes (19): capturePane(), composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), hasLiveTerminalComposer(), isTerminalAgentWorking(), isTerminalOverlay() (+11 more)

### Community 47 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 48 - "shell.ts"
Cohesion: 0.15
Nodes (24): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), onShellDeepLink(), onShellNotificationReply(), openShellSettings() (+16 more)

### Community 50 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 51 - "active-sessions.ts"
Cohesion: 0.19
Nodes (23): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+15 more)

### Community 52 - ".replyUserInputInternal"
Cohesion: 0.17
Nodes (6): persistedFormAnswer(), TerminalFormContinuation, validateUserInputForm(), TerminalFormReplyError, PendingUserInput, UserInputReplyInput

### Community 53 - "node-routes.ts"
Cohesion: 0.09
Nodes (22): AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema (+14 more)

### Community 54 - "capture-workspace.ts"
Cohesion: 0.19
Nodes (21): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+13 more)

### Community 55 - "HubEvent"
Cohesion: 0.11
Nodes (14): WorkspaceFixture, ComputerManagerEvents, brief(), HubEventSource, PushSender, PushState, directories, RFC-8030 (+6 more)

### Community 56 - "ComputerSummary"
Cohesion: 0.14
Nodes (9): fixture(), session(), sessionAtLeastAsNew(), RegisteredComputer, ComputerSummary, actions, computers, root (+1 more)

### Community 57 - "session-knowledge-store.ts"
Cohesion: 0.10
Nodes (20): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+12 more)

### Community 58 - "session-store-providers.test.ts"
Cohesion: 0.11
Nodes (10): claude(), clearFixture(), copilot(), disk, event(), fixtures, holdOtherWrite(), releases (+2 more)

### Community 59 - "terminal-session.test.ts"
Cohesion: 0.11
Nodes (18): paneEvidenceCount(), paneShowsText(), parseTerminalUpdateNotice(), terminalChecklistState(), terminalFormCommitKeys(), bracketedTabPane, clearFixture(), desktopInstallPane (+10 more)

### Community 60 - "SessionKnowledgeStore"
Cohesion: 0.17
Nodes (7): SessionKnowledgeRecoveryError, SessionKnowledgeStore, disk, fixture(), fixtures, releases, root()

### Community 61 - "workspace-browser.ts"
Cohesion: 0.19
Nodes (17): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+9 more)

### Community 62 - "NewSessionDialog"
Cohesion: 0.15
Nodes (21): activateSession(), createSession(), executeCommand(), listDirectories(), listHistory(), listWorkspace(), validateSessionDirectory(), AddKnowledgeRootDialog() (+13 more)

### Community 63 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 65 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 66 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 67 - "session-resource-routes.test.ts"
Cohesion: 0.13
Nodes (9): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription (+1 more)

### Community 68 - "NodeIdentityStore"
Cohesion: 0.17
Nodes (5): BuildAppOptions, ComputerRegistry, directories, remoteSnapshotFixture(), NodeIdentityStore

### Community 69 - "session-admission-lifecycle.test.ts"
Cohesion: 0.12
Nodes (13): ClaudeSdk, cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle(), deferred() (+5 more)

### Community 70 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 71 - "CopilotClientLike"
Cohesion: 0.12
Nodes (8): CopilotClientLike, fixtures, recoverAndSeed(), releases, boots, [directory, backend, resultPath, phase = 'idle'], fixtureRoot, CopilotResourceClient

### Community 72 - "use-session-knowledge-root.ts"
Cohesion: 0.21
Nodes (12): getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey(), knowledgePositionForBinding(), SessionIdentity (+4 more)

### Community 73 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 74 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 75 - "queued-provider-dispatch.test.ts"
Cohesion: 0.17
Nodes (9): claudeFixture(), copilotFixture(), copilotSession(), fixtures, gate(), originalQueue, pause(), releases (+1 more)

### Community 76 - "check-workspace-review-regressions.ts"
Cohesion: 0.15
Nodes (11): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+3 more)

### Community 77 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 78 - "registerSessionKnowledgeRoutes"
Cohesion: 0.30
Nodes (11): registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession(), recordReplacement() (+3 more)

### Community 79 - "normalizeKnowledgeRelativePath"
Cohesion: 0.35
Nodes (11): joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath(), slashPath(), scopedKnowledgeRoot(), KnowledgeRootChoice (+3 more)

### Community 80 - "package.json"
Cohesion: 0.15
Nodes (11): directory, { values }, workflows, name, packageManager, pnpm, onlyBuiltDependencies, private (+3 more)

### Community 81 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 82 - "SessionKnowledgeBinding"
Cohesion: 0.28
Nodes (3): bindingKey(), SessionKnowledgeConflictError, SessionKnowledgeBinding

### Community 83 - "shell-notifications.ts"
Cohesion: 0.26
Nodes (10): key(), label(), NotifiableSession, notificationState(), requestId(), SessionNotificationState, ShellNotificationContext, shellNotifications() (+2 more)

### Community 84 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+4 more)

### Community 85 - "session-knowledge-routes.test.ts"
Cohesion: 0.18
Nodes (9): ServerRole, SessionMetadataLookup, disk, FakeManager, fixtures, gate(), holdWrite(), releases (+1 more)

### Community 86 - "promotion-monitor.test.ts"
Cohesion: 0.30
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 87 - "recovery-seed-guards.test.ts"
Cohesion: 0.18
Nodes (8): bootLegacy(), directories, execute, pending, releases, SeedState, services, stores

### Community 88 - "SessionAdmissions"
Cohesion: 0.20
Nodes (4): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions

### Community 89 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 90 - "session-knowledge-routes.ts"
Cohesion: 0.18
Nodes (6): Lineage, RegistrationGeneration, ReplacementEvidence, SessionKnowledgeLifecycle, sessionParams, updateSchema

### Community 91 - ".oxlintrc.json"
Cohesion: 0.20
Nodes (9): ignorePatterns, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/**, graphify/.venv/** (+1 more)

### Community 92 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 94 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 95 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 96 - "session-resource-transport.ts"
Cohesion: 0.36
Nodes (7): readClaudeMcp(), readCopilotResource(), copilotTransport(), disposals, Frame, write(), unavailable()

### Community 97 - "KnowledgePosition"
Cohesion: 0.36
Nodes (4): WorkspaceFixtureOptions, KnowledgePosition, KnowledgeRestoreState, base

### Community 99 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 100 - "recovery-context.ts"
Cohesion: 0.38
Nodes (4): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief

### Community 101 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 102 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 104 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 106 - "removeComputer"
Cohesion: 0.60
Nodes (5): addComputer(), removeComputer(), ComputersDialog(), remove(), submit()

### Community 111 - "MermaidDiagram.tsx"
Cohesion: 0.67
Nodes (3): drawDiagram(), drawing, MermaidDiagram()

## Knowledge Gaps
- **663 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+658 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1003 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **25 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `.clearSerialized`, `SessionFileUpload`, `session-resource-routes.test.ts`, `agent-service.ts`, `session-resources.ts`, `claude-agent-service.ts`, `.get`, `CopilotSessionLike`, `.publish`, `.replyUserInputInternal`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `RemoteNodeClient` connect `RemoteNodeClient` to `SessionFileUpload`, `contracts.ts`, `session-resources.ts`, `remote-node-client.ts`, `.replyUserInputInternal`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `ClaudeAgentService` connect `ClaudeAgentService` to `SessionFileUpload`, `session-resource-routes.test.ts`, `contracts.ts`, `session-resources.ts`, `claude-agent-service.ts`, `session-reply-durability.test.ts`, `CopilotSessionLike`, `SessionService`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _663 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.040751614797416326 - nodes in this community are weakly interconnected._
- **Should `api.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.034762596899224806 - nodes in this community are weakly interconnected._
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
