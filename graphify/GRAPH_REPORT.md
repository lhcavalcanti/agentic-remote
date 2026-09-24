# Agentic Remote - Graphify code map

Snapshot: `dca0c2cec41eb5be7369e72e0c3714f7d9ec8ca6c41e87f0eea4388a3f9950de`

Source checkout: `c3fce4f85331366337112cd0436848fa0ae8a0a2`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 230 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 230 files · ~469,075 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3516 nodes · 9970 edges · 144 communities (109 shown, 19 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 731 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App
- App.tsx
- api.ts
- AgentService
- SessionStore
- registerHubRoutes
- ClaudeAgentService
- contracts.ts
- session-resources.ts
- terminal-session.ts
- agentic-remote-promotion-monitor
- SessionDetail
- markdown-navigation.ts
- queued-dispatch.test.ts
- agent-service.ts
- .get
- terminal-session.test.ts
- tmux-errors.integration.test.ts
- RemoteNodeClient
- TmuxTerminalSessionController
- session-presentation.ts
- bundle
- FakeSessionService
- ProviderSessionService
- lib.rs
- shell.ts
- background-task-adapter.ts
- config.rs
- .handleSessionEvent
- pwa.ts
- knowledge-tree.ts
- claude-agent-service.ts
- hub-routes.ts
- devDependencies
- SessionKnowledgeStore
- agentic-remote
- dependencies
- node-routes.ts
- agentic-remote-promotion-setup
- remote-node-client.ts
- terminal-startup-queue.test.ts
- CopilotSessionLike
- SessionOrderStore
- delegated-transcription-service.ts
- scripts
- PushNotificationService
- KnowledgeStore
- transcription-service.ts
- compilerOptions
- ComputerManager
- NewSessionDialog
- capture-workspace.ts
- session-store.ts
- app.ts
- ManagedSession
- session-clear-transcript.test.ts
- compilerOptions
- session-resource-routes.test.ts
- session-knowledge-store.ts
- compilerOptions
- check-workspace-review-regressions.ts
- compilerOptions
- NodeIdentityStore
- recordValue
- session-reply-durability.test.ts
- session-store-providers.test.ts
- workspace-browser.ts
- CopilotClientLike
- session-admission-lifecycle.test.ts
- use-session-knowledge-root.ts
- react
- ReaderWorkspace
- recovery-resend-durability.test.ts
- capture
- background-task-stop.test.ts
- workspace-fixtures.ts
- desktop.json
- normalizeKnowledgeRelativePath
- BackgroundTasksDialog.tsx
- capture-workbench-review.ts
- package.json
- .oxlintrc.json
- settings-local.json
- background-task-tracker.ts
- push-notification-service.ts
- registerSessionKnowledgeRoutes
- session-resource-clear.test.ts
- TranscriptionError
- scripts
- promotion-monitor.test.ts
- recovery-seed-guards.test.ts
- html-preview.ts
- session-knowledge-routes.ts
- SessionResources.tsx
- setupWorkspaceFixture
- node:fs/promises
- generate-pwa-icons.ts
- session-enqueue-clear.test.ts
- session-resource-providers.test.ts
- session-resource-transport.ts
- bridge.rs
- screenshot-stability.test.ts
- KnowledgePosition
- SessionFileUpload
- agent-service-recovery.test.ts
- release-publication.test.ts
- recovery-context.ts
- settings.ts
- composer-layout.test.ts
- MarkdownCodeBlock.tsx
- removeComputer
- promotion-setup-execution.test.ts
- terminal-send-uncertainty.test.ts
- MockMediaRecorder
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
1. `SessionDetail` - 282 edges
2. `App()` - 248 edges
3. `AgentService` - 219 edges
4. `SessionStore` - 150 edges
5. `ClaudeAgentService` - 119 edges
6. `ComputerManager` - 81 edges
7. `registerHubRoutes()` - 75 edges
8. `SessionService` - 71 edges
9. `RemoteNodeClient` - 66 edges
10. `TmuxTerminalSessionController` - 60 edges

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

## Communities (144 total, 19 thin omitted)

### Community 0 - "App"
Cohesion: 0.04
Nodes (121): submissionReceiptFromError(), terminalDraftConflictFromError(), saveSessionOrderLane(), activeComposerPastes(), App(), adoptConversationReplacement(), appendComposerForKey(), appKeyDown() (+113 more)

### Community 1 - "App.tsx"
Cohesion: 0.03
Nodes (102): configureRuntime(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph() (+94 more)

### Community 2 - "api.ts"
Cohesion: 0.04
Nodes (105): addKnowledgeRoot(), bootstrapSessionOrder(), cancelBackgroundTask(), cancelSession(), clearConversation(), definiteDispatchRefusals, deleteKnowledgeRoot(), deleteSession() (+97 more)

### Community 3 - "AgentService"
Cohesion: 0.06
Nodes (6): AgentService, isUncertainDelivery(), httpBoundary(), isTerminalAgentWorking(), TerminalSessionController, deliveryUncertaintyFromError()

### Community 4 - "SessionStore"
Cohesion: 0.05
Nodes (35): connect(), createStore(), deferred(), disk, enqueue(), fixture(), fixtures, holdClaimWrite() (+27 more)

### Community 5 - "registerHubRoutes"
Cohesion: 0.06
Nodes (7): managedSession(), registerHubRoutes(), SessionMuteCarrier, registerNodeRoutes(), SessionService, BackgroundTaskSnapshot, ManagedRemovedQueuedPrompt

### Community 6 - "ClaudeAgentService"
Cohesion: 0.06
Nodes (9): ClaudeAgentService, isMissingClaudeSessionError(), fixture(), queueConflict(), claudeFixture(), claudeFixture(), QueuedPromptReservation, QueuedPromptDispatchResult (+1 more)

### Community 7 - "contracts.ts"
Cohesion: 0.05
Nodes (48): ClaudeAgentServiceEvents, managers, releases, remote, RemoteResync, RemoteSessionRead, RegistryState, directories (+40 more)

### Community 8 - "session-resources.ts"
Cohesion: 0.08
Nodes (50): ActiveClaudeQuery, ClaudeResources, releases, session, snapshot, claudeMcp(), claudeSkillNames(), copilotMcp (+42 more)

### Community 9 - "terminal-session.ts"
Cohesion: 0.08
Nodes (64): activeBottomFrame(), boxedComposerFrame(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), COMPOSER_PLACEHOLDERS, composerFrameText(), composerHoldsOtherText() (+56 more)

### Community 10 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (67): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+59 more)

### Community 11 - "SessionDetail"
Cohesion: 0.07
Nodes (11): persistedFormAnswer(), TerminalFormContinuation, fixture(), answer(), claudeRequest(), copilotRequest(), StoredSession, TerminalFormReplyError (+3 more)

### Community 12 - "markdown-navigation.ts"
Cohesion: 0.06
Nodes (54): UserInputField, UserInputFieldValue, followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), MarkdownImage(), missingDocumentFragment(), WorkspaceDialog() (+46 more)

### Community 13 - "queued-dispatch.test.ts"
Cohesion: 0.05
Nodes (30): acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight(), QueuedDelivery, QueuedDispatches (+22 more)

### Community 14 - "agent-service.ts"
Cohesion: 0.05
Nodes (51): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), ActivityToolStart, AgentServiceEvents, ansiSequence, commandShortcut() (+43 more)

### Community 15 - ".get"
Cohesion: 0.09
Nodes (5): isMissingSessionError(), removeCopilotSessionFiles(), preparePrompt(), TranscriptObservation, PendingPermission

### Community 16 - "terminal-session.test.ts"
Cohesion: 0.07
Nodes (43): directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), exec, formFixture(), horizontalFormFixture() (+35 more)

### Community 17 - "tmux-errors.integration.test.ts"
Cohesion: 0.07
Nodes (43): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates(), isCopilotProcess() (+35 more)

### Community 18 - "RemoteNodeClient"
Cohesion: 0.06
Nodes (7): RemoteNodeClient, NodeInfo, RemovedQueuedPrompt, WorkspaceFile, WorkspaceListing, KnowledgeFolderState, WorkspaceFileIcon()

### Community 19 - "TmuxTerminalSessionController"
Cohesion: 0.12
Nodes (10): copilotCommand(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand(), safeWindowName(), submitTerminalForm(), tmuxTargetForPid() (+2 more)

### Community 20 - "session-presentation.ts"
Cohesion: 0.10
Nodes (37): SessionFilter, sessionNavigationView, attentionRank, computerTone(), executionModeName(), matchesSessionSearch(), providerName(), recentFirst() (+29 more)

### Community 21 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 22 - "FakeSessionService"
Cohesion: 0.07
Nodes (4): FakeSessionService, routingFixture(), session(), temporaryDirectory()

### Community 24 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 25 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 26 - "background-task-adapter.ts"
Cohesion: 0.13
Nodes (37): addActivity(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), boundedText(), CopilotTaskInfo, CopilotTaskProgress, errorValue(), eventTask() (+29 more)

### Community 27 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 28 - ".handleSessionEvent"
Cohesion: 0.12
Nodes (23): activityKind(), activityResult(), agentMode(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), isBackgroundTaskEvent() (+15 more)

### Community 29 - "pwa.ts"
Cohesion: 0.11
Nodes (34): deletePushSubscription(), getProviderRuntimeOptions(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate() (+26 more)

### Community 30 - "knowledge-tree.ts"
Cohesion: 0.09
Nodes (34): WorkspaceEntry, listKnowledgeEntries(), readKnowledgeFile(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor() (+26 more)

### Community 31 - "claude-agent-service.ts"
Cohesion: 0.11
Nodes (22): AuthStatusRunner, ClaudeQuestion, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission, PendingClaudeReply, toolResultText() (+14 more)

### Community 32 - "hub-routes.ts"
Cohesion: 0.07
Nodes (35): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+27 more)

### Community 33 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 34 - "SessionKnowledgeStore"
Cohesion: 0.12
Nodes (11): bindingKey(), SessionKnowledgeConflictError, SessionKnowledgeRecoveryError, SessionKnowledgeStore, stateWithPaths(), disk, fixture(), fixtures (+3 more)

### Community 35 - "agentic-remote"
Cohesion: 0.13
Nodes (31): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+23 more)

### Community 36 - "dependencies"
Cohesion: 0.06
Nodes (33): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, @fastify/multipart, @fastify/static, @fastify/websocket, ffmpeg-static (+25 more)

### Community 37 - "node-routes.ts"
Cohesion: 0.07
Nodes (28): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile(), AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER (+20 more)

### Community 38 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (30): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+22 more)

### Community 39 - "remote-node-client.ts"
Cohesion: 0.11
Nodes (20): DEFINITE_DISPATCH_REFUSALS, headerSafe(), REDIRECT_STATUSES, client(), servers, session, RemoteNodeRedirectError, RemoteNodeRequestError (+12 more)

### Community 40 - "terminal-startup-queue.test.ts"
Cohesion: 0.13
Nodes (26): findActiveCopilotSessions(), appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs (+18 more)

### Community 41 - "CopilotSessionLike"
Cohesion: 0.08
Nodes (10): CopilotSessionLike, terminalFormSteps(), configurableModel(), DeferredSession, directories, FakeCopilotClient, services, startupFifoFixture() (+2 more)

### Community 42 - "SessionOrderStore"
Cohesion: 0.16
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 43 - "delegated-transcription-service.ts"
Cohesion: 0.11
Nodes (13): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, transcriptionComputerName() (+5 more)

### Community 44 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 45 - "PushNotificationService"
Cohesion: 0.19
Nodes (3): HubEventSource, PushNotificationService, registerPushRoutes()

### Community 46 - "KnowledgeStore"
Cohesion: 0.18
Nodes (7): WorkspaceFixtureState, KnowledgeRootReservation, KnowledgeState, KnowledgeStore, directories, fixture(), KnowledgeRoot

### Community 47 - "transcription-service.ts"
Cohesion: 0.10
Nodes (20): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+12 more)

### Community 48 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 49 - "ComputerManager"
Cohesion: 0.21
Nodes (7): ComputerManager, fixture(), session(), sessionAtLeastAsNew(), RegisteredComputer, createHub(), ComputerSummary

### Community 50 - "NewSessionDialog"
Cohesion: 0.15
Nodes (22): activateSession(), createSession(), executeCommand(), listDirectories(), listHistory(), listWorkspace(), validateSessionDirectory(), AddKnowledgeRootDialog() (+14 more)

### Community 51 - "capture-workspace.ts"
Cohesion: 0.20
Nodes (20): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+12 more)

### Community 52 - "session-store.ts"
Cohesion: 0.10
Nodes (16): TerminalDiscoveryError, activityDuration(), activityResultPreview(), archivedMessage(), DiscoveredSession, emptyRetirements, PendingChange, RecoveryResend (+8 more)

### Community 53 - "app.ts"
Cohesion: 0.15
Nodes (13): prefixes, session, trusted, untrusted, directories, buildApp(), errorStatusCode(), isAppleTouchIconProbe() (+5 more)

### Community 54 - "ManagedSession"
Cohesion: 0.11
Nodes (17): ServerRole, RemoteSessionListing, SessionMetadataLookup, disk, FakeManager, fixtures, gate(), holdWrite() (+9 more)

### Community 55 - "session-clear-transcript.test.ts"
Cohesion: 0.11
Nodes (9): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions, disk, fixtures, gate(), holdTurnWrite() (+1 more)

### Community 56 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 57 - "session-resource-routes.test.ts"
Cohesion: 0.12
Nodes (9): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription (+1 more)

### Community 58 - "session-knowledge-store.ts"
Cohesion: 0.11
Nodes (18): bindingSchema, Identity, PathRecord, pathRecordKey(), PathState, pathStateFor(), pathStateSchema, PersistedBinding (+10 more)

### Community 59 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 60 - "check-workspace-review-regressions.ts"
Cohesion: 0.13
Nodes (15): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+7 more)

### Community 61 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 62 - "NodeIdentityStore"
Cohesion: 0.17
Nodes (5): BuildAppOptions, ComputerRegistry, directories, remoteSnapshotFixture(), NodeIdentityStore

### Community 63 - "recordValue"
Cohesion: 0.18
Nodes (19): attachmentModeValue(), backgroundHandoff(), booleanValue(), eventString(), lastForegroundCompletionAt(), normalizedToolName(), notificationKind(), parsedValue() (+11 more)

### Community 64 - "session-reply-durability.test.ts"
Cohesion: 0.18
Nodes (15): assistantFixture(), claudeFixture(), claudeQuestions(), claudeRunFixture(), copilotFixture(), copilotRunFixture(), disk, fallbackFormFixture() (+7 more)

### Community 65 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (8): claude(), clearFixture(), copilot(), disk, event(), fixtures, releases, sdkSession()

### Community 66 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 67 - "CopilotClientLike"
Cohesion: 0.11
Nodes (8): CopilotClientLike, fixtures, recoverAndSeed(), releases, boots, [directory, backend, resultPath, phase = 'idle'], fixtureRoot, CopilotResourceClient

### Community 68 - "session-admission-lifecycle.test.ts"
Cohesion: 0.12
Nodes (12): ClaudeSdk, cleanupFixtures(), directories, queryHandle(), services, waitForIdle(), deferred(), disk (+4 more)

### Community 69 - "use-session-knowledge-root.ts"
Cohesion: 0.19
Nodes (12): getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey(), knowledgePositionForBinding(), SessionIdentity (+4 more)

### Community 70 - "react"
Cohesion: 0.13
Nodes (12): react, KnowledgeRootChoice, KnowledgeRootSession, actions, computers, root, session, KnowledgeRootSelector() (+4 more)

### Community 71 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 72 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 73 - "capture"
Cohesion: 0.18
Nodes (15): releaseRecording(), shortcutKeys(), startRecording(), stopRecording(), binding(), bindingLabel(), capturableCode(), isModifierCode() (+7 more)

### Community 74 - "background-task-stop.test.ts"
Cohesion: 0.23
Nodes (12): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), started() (+4 more)

### Community 75 - "workspace-fixtures.ts"
Cohesion: 0.15
Nodes (13): documents, FIXTURE_NOW, fixtureBackgroundTasks, fixtureComputers, fixtureEndpoints, fixtureKnowledgeListings, fixtureKnowledgePositions, fixtureModels (+5 more)

### Community 76 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 77 - "normalizeKnowledgeRelativePath"
Cohesion: 0.29
Nodes (12): knowledgeFileSchema, knowledgeRelativePathSchema, scopedKnowledgePath(), pathRecordSchema, joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath() (+4 more)

### Community 78 - "BackgroundTasksDialog.tsx"
Cohesion: 0.23
Nodes (10): DialogFrame(), BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive() (+2 more)

### Community 79 - "capture-workbench-review.ts"
Cohesion: 0.17
Nodes (10): frame(), geometry, output, scratch, screenshot(), { values }, fixtureSessions, IDLE_SESSION_ID (+2 more)

### Community 80 - "package.json"
Cohesion: 0.15
Nodes (11): directory, { values }, workflows, name, packageManager, pnpm, onlyBuiltDependencies, private (+3 more)

### Community 81 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 82 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 83 - "background-task-tracker.ts"
Cohesion: 0.27
Nodes (7): snapshot(), backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 84 - "push-notification-service.ts"
Cohesion: 0.15
Nodes (10): brief(), PushSender, PushState, directories, RFC-8030, RFC-8030, sessionMuteSchema, subscriptionSchema (+2 more)

### Community 85 - "registerSessionKnowledgeRoutes"
Cohesion: 0.33
Nodes (11): registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession(), recordReplacement() (+3 more)

### Community 86 - "session-resource-clear.test.ts"
Cohesion: 0.21
Nodes (12): apps, directories, directory(), obstructUploads(), pairedFixture(), providerFixture(), providers, seed() (+4 more)

### Community 87 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 88 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+4 more)

### Community 89 - "promotion-monitor.test.ts"
Cohesion: 0.30
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 90 - "recovery-seed-guards.test.ts"
Cohesion: 0.18
Nodes (8): bootLegacy(), directories, execute, pending, releases, SeedState, services, stores

### Community 91 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 92 - "session-knowledge-routes.ts"
Cohesion: 0.18
Nodes (6): Lineage, RegistrationGeneration, ReplacementEvidence, SessionKnowledgeLifecycle, sessionParams, updateSchema

### Community 93 - "SessionResources.tsx"
Cohesion: 0.18
Nodes (7): Catalog, CatalogResult, sourceLabels, statusLabels, mcp, session, skills

### Community 94 - "setupWorkspaceFixture"
Cohesion: 0.24
Nodes (6): pageFor(), createWorkspaceFixtureState(), fixtureBaseUrl(), fixtureValue(), setupWorkspaceFixture(), fixtureApi()

### Community 95 - "node:fs/promises"
Cohesion: 0.27
Nodes (7): disk, fixture(), fixtures, prompt(), ready(), releases, session()

### Community 96 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 97 - "session-enqueue-clear.test.ts"
Cohesion: 0.29
Nodes (9): disk, EnqueueCase, fixtures, gate(), holdEnqueue(), joinedEnqueue(), quiet(), releases (+1 more)

### Community 98 - "session-resource-providers.test.ts"
Cohesion: 0.22
Nodes (9): ClaudeMcpRead, deferred(), DiscoveredMcp, DiscoveredSkills, fixtures, Mcp, pause(), releases (+1 more)

### Community 99 - "session-resource-transport.ts"
Cohesion: 0.31
Nodes (8): CopilotResourceMethod, readClaudeMcp(), readCopilotResource(), copilotTransport(), disposals, Frame, write(), unavailable()

### Community 100 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 101 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 102 - "KnowledgePosition"
Cohesion: 0.36
Nodes (4): WorkspaceFixtureOptions, KnowledgePosition, KnowledgeRestoreState, base

### Community 104 - "agent-service-recovery.test.ts"
Cohesion: 0.29
Nodes (5): fixture(), holdProbe(), fixtures, gate(), releases

### Community 105 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 106 - "recovery-context.ts"
Cohesion: 0.38
Nodes (4): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief

### Community 107 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 108 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 109 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 110 - "removeComputer"
Cohesion: 0.60
Nodes (5): addComputer(), removeComputer(), ComputersDialog(), remove(), submit()

## Knowledge Gaps
- **664 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+659 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1002 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **19 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `SessionStore`, `SessionFileUpload`, `session-resources.ts`, `SessionDetail`, `queued-dispatch.test.ts`, `.get`, `session-store.ts`, `session-resource-routes.test.ts`, `.handleSessionEvent`, `claude-agent-service.ts`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionStore` to `AgentService`, `ClaudeAgentService`, `SessionFileUpload`, `SessionDetail`, `queued-dispatch.test.ts`, `.get`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `RemoteNodeClient` connect `RemoteNodeClient` to `SessionFileUpload`, `claude-agent-service.ts`, `remote-node-client.ts`, `contracts.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _664 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.041061046511627904 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.02699724517906336 - nodes in this community are weakly interconnected._
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
