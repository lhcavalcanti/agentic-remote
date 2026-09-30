# Agentic Remote - Graphify code map

Snapshot: `5f7ef606b5ac5118d5d794295a3bc00d2966b6e31b1c46b0d76ad13f400cdf50`

Source checkout: `275d1dea22a0337b36a45a35fc8f483431d5765c`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 230 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 230 files · ~470,108 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3505 nodes · 9888 edges · 144 communities (108 shown, 21 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 728 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- SessionDetail
- AgentService
- App.tsx
- ClaudeAgentService
- api.ts
- App
- agent-service.ts
- agentic-remote-promotion-monitor
- markdown-navigation.ts
- session-resources.ts
- terminal-session.ts
- sessionKey
- hub-routes.ts
- session-knowledge-store.ts
- TmuxTerminalSessionController
- claude-agent-service.ts
- ComputerManager
- .publishError
- TerminalSessionController
- queued-provider-dispatch.test.ts
- CopilotSessionLike
- session-knowledge-routes.test.ts
- bundle
- pwa.ts
- ProviderSessionService
- RemoteNodeClient
- terminal-startup-queue.test.ts
- FakeSessionService
- background-task-adapter.ts
- lib.rs
- shell.ts
- config.rs
- contracts.ts
- SessionService
- devDependencies
- agentic-remote
- dependencies
- agentic-remote-promotion-setup
- tmux-errors.integration.test.ts
- node-routes.ts
- terminal-session.test.ts
- session-enqueue-clear.test.ts
- SessionOrderStore
- app.ts
- .clearSerialized
- knowledge-tree.ts
- scripts
- PushNotificationService
- remote-node-client.ts
- session-knowledge-routes.ts
- noTmuxServer
- transcription-service.ts
- session-presentation.ts
- compilerOptions
- session-store.ts
- delegated-transcription-service.ts
- session-resource-clear.test.ts
- NewSessionDialog
- session-reply-durability.test.ts
- capture-workspace.ts
- ResourceReads
- session-clear-transcript.test.ts
- compilerOptions
- compilerOptions
- compilerOptions
- directory-browser.ts
- event-log.ts
- session-store-providers.test.ts
- workspace-browser.ts
- NodeIdentityStore
- use-session-knowledge-root.ts
- recordValue
- api.test.ts
- ReaderWorkspace
- workspace-fixtures.ts
- background-task-stop.test.ts
- queued-dispatch.test.ts
- recovery-resend-durability.test.ts
- session-resource-routes.test.ts
- SessionNavigation.test.tsx
- check-workspace-review-regressions.ts
- ComputerSummary
- capture
- SessionResources.tsx
- desktop.json
- BackgroundTasksDialog.tsx
- capture-workbench-review.ts
- package.json
- settings-local.json
- push-notification-service.ts
- TranscriptionError
- react
- scripts
- background-task-tracker.ts
- promotion-monitor.test.ts
- recovery-seed-guards.test.ts
- html-preview.ts
- setupWorkspaceFixture
- .oxlintrc.json
- generate-pwa-icons.ts
- DeferredSession
- bridge.rs
- screenshot-stability.test.ts
- KnowledgePosition
- SessionFileUpload
- release-publication.test.ts
- deleteKnowledgeRoot
- recovery-context.ts
- settings.ts
- composer-layout.test.ts
- MarkdownCodeBlock.tsx
- session-navigation-view.test.ts
- api-origin.test.ts
- promotion-setup-execution.test.ts
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

## Communities (144 total, 21 thin omitted)

### Community 0 - "SessionDetail"
Cohesion: 0.05
Nodes (38): fixture(), connect(), createStore(), deferred(), disk, enqueue(), fixture(), fixtures (+30 more)

### Community 1 - "AgentService"
Cohesion: 0.06
Nodes (7): AgentService, isUncertainDelivery(), RuntimeConfigurationError, preparePrompt(), queueConflict(), QueuedPromptReservation, deliveryUncertaintyFromError()

### Community 2 - "App.tsx"
Cohesion: 0.03
Nodes (95): configureRuntime(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph() (+87 more)

### Community 3 - "ClaudeAgentService"
Cohesion: 0.04
Nodes (12): ClaudeAgentService, isMissingClaudeSessionError(), cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle() (+4 more)

### Community 4 - "api.ts"
Cohesion: 0.04
Nodes (87): parseSubmissionReceipt(), submissionReceiptFromError(), addKnowledgeRoot(), bootstrapSessionOrder(), cancelBackgroundTask(), cancelSession(), definiteDispatchRefusals, dispatchQueuedPrompt() (+79 more)

### Community 5 - "App"
Cohesion: 0.04
Nodes (81): deleteSession(), readKnowledgeFile(), recoverConversation(), saveSessionOrderLane(), saveSessionVisibility(), transcribeAudio(), App(), adoptConversationReplacement() (+73 more)

### Community 6 - "agent-service.ts"
Cohesion: 0.05
Nodes (66): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, AgentServiceEvents (+58 more)

### Community 7 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (67): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+59 more)

### Community 8 - "markdown-navigation.ts"
Cohesion: 0.06
Nodes (54): UserInputField, UserInputFieldValue, followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), MarkdownImage(), missingDocumentFragment(), WorkspaceDialog() (+46 more)

### Community 9 - "session-resources.ts"
Cohesion: 0.09
Nodes (45): ClaudeResources, claudeMcp(), claudeSkillNames(), copilotMcp, copilotSkills, copilotWorkspaceMcp, CopilotWorkspaceSkills, count() (+37 more)

### Community 10 - "terminal-session.ts"
Cohesion: 0.09
Nodes (52): composer(), processAdapter, activeBottomFrame(), boxedComposerFrame(), cleanDialogLine(), clearAutomaticStartupPrompts(), COMPOSER_PLACEHOLDERS, composerFrameText() (+44 more)

### Community 11 - "sessionKey"
Cohesion: 0.08
Nodes (59): clearConversation(), reorderQueuedPrompts(), uploadSessionFile(), activeComposerPastes(), appendComposerForKey(), applySession(), askAboutKnowledgeFile(), cancelSelectedBackgroundTask() (+51 more)

### Community 12 - "hub-routes.ts"
Cohesion: 0.06
Nodes (51): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+43 more)

### Community 13 - "session-knowledge-store.ts"
Cohesion: 0.07
Nodes (30): bindingKey(), bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor() (+22 more)

### Community 14 - "TmuxTerminalSessionController"
Cohesion: 0.11
Nodes (17): capturePane(), copilotCommand(), execFileAsync, hasLiveTerminalComposer(), isTerminalAgentWorking(), isTerminalOverlay(), isTerminalSessionInUsePrompt(), listTmuxSessions() (+9 more)

### Community 15 - "claude-agent-service.ts"
Cohesion: 0.07
Nodes (27): AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission, PendingClaudeReply (+19 more)

### Community 16 - "ComputerManager"
Cohesion: 0.16
Nodes (7): ComputerManager, managedSession(), RemoteSessionListing, registerHubRoutes(), ManagedRemovedQueuedPrompt, ManagedSession, SessionListing

### Community 18 - "TerminalSessionController"
Cohesion: 0.08
Nodes (11): isForegroundCompletionEvent(), isForegroundLifecycleEvent(), persistedFormAnswer(), statusFromEvents(), TerminalFormContinuation, validateUserInputForm(), TerminalFormReplyError, TerminalSessionController (+3 more)

### Community 19 - "queued-provider-dispatch.test.ts"
Cohesion: 0.08
Nodes (20): acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight(), QueuedDelivery, QueuedDispatches (+12 more)

### Community 20 - "CopilotSessionLike"
Cohesion: 0.05
Nodes (21): CopilotClientLike, CopilotSessionLike, holdProbe(), fixtures, gate(), releases, terminalFormSteps(), configurableModel() (+13 more)

### Community 21 - "session-knowledge-routes.test.ts"
Cohesion: 0.08
Nodes (18): WorkspaceFixtureState, ServerRole, SessionMetadataLookup, SessionMuteCarrier, KnowledgeRootReservation, KnowledgeState, KnowledgeStore, directories (+10 more)

### Community 22 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 23 - "pwa.ts"
Cohesion: 0.09
Nodes (38): directories, AppVersion, parseAppVersion(), deletePushSubscription(), getPushPublicKey(), savePushSubscription(), sendTestPushNotification(), applyPwaUpdate() (+30 more)

### Community 25 - "RemoteNodeClient"
Cohesion: 0.07
Nodes (7): RemoteNodeClient, BackgroundTaskSnapshot, NodeInfo, RemovedQueuedPrompt, WorkspaceFile, WorkspaceListing, KnowledgeFolderState

### Community 26 - "terminal-startup-queue.test.ts"
Cohesion: 0.10
Nodes (34): directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), exec, formFixture(), horizontalFormFixture() (+26 more)

### Community 27 - "FakeSessionService"
Cohesion: 0.06
Nodes (4): FakeSessionService, routingFixture(), session(), temporaryDirectory()

### Community 28 - "background-task-adapter.ts"
Cohesion: 0.12
Nodes (39): attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), CopilotTaskInfo, CopilotTaskProgress, eventString() (+31 more)

### Community 29 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 30 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 31 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 32 - "contracts.ts"
Cohesion: 0.07
Nodes (30): ComputerManagerEvents, RemoteResync, RemoteSessionRead, normalizeNodeUrl(), ActivityStatus, AddComputerInput, AddKnowledgeRootInput, BackgroundTaskAttachmentMode (+22 more)

### Community 34 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 35 - "agentic-remote"
Cohesion: 0.13
Nodes (31): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+23 more)

### Community 36 - "dependencies"
Cohesion: 0.06
Nodes (33): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, @fastify/multipart, @fastify/static, @fastify/websocket, ffmpeg-static (+25 more)

### Community 37 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (30): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+22 more)

### Community 38 - "tmux-errors.integration.test.ts"
Cohesion: 0.13
Nodes (30): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+22 more)

### Community 39 - "node-routes.ts"
Cohesion: 0.06
Nodes (27): managers, releases, remote, RegistryState, StoredNodeIdentity, AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, configureRuntimeSchema (+19 more)

### Community 40 - "terminal-session.test.ts"
Cohesion: 0.10
Nodes (27): composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), occurrences(), paneEvidenceCount(), paneShowsText(), parseTerminalUpdateNotice() (+19 more)

### Community 41 - "session-enqueue-clear.test.ts"
Cohesion: 0.09
Nodes (23): ClaudeSdk, deferred(), disk, enqueue(), fixtures, holdAdmissionWrite(), releases, disk (+15 more)

### Community 42 - "SessionOrderStore"
Cohesion: 0.15
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 43 - "app.ts"
Cohesion: 0.13
Nodes (16): buildApp(), errorStatusCode(), isAppleTouchIconProbe(), transcriptionComputerName(), FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams (+8 more)

### Community 44 - ".clearSerialized"
Cohesion: 0.13
Nodes (4): agentMode(), isMissingSessionError(), removeCopilotSessionFiles(), TranscriptObservation

### Community 45 - "knowledge-tree.ts"
Cohesion: 0.13
Nodes (24): WorkspaceEntry, listKnowledgeEntries(), cancelKnowledgeRestore(), collapseKnowledgeTree(), knowledgeTreeKeyDown(), loadKnowledgeChain(), loadKnowledgeFolder(), openKnowledgeFolder() (+16 more)

### Community 46 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 47 - "PushNotificationService"
Cohesion: 0.19
Nodes (3): HubEventSource, PushNotificationService, registerPushRoutes()

### Community 48 - "remote-node-client.ts"
Cohesion: 0.12
Nodes (15): DEFINITE_DISPATCH_REFUSALS, headerSafe(), REDIRECT_STATUSES, client(), servers, session, RemoteNodeRedirectError, RemoteNodeRequestError (+7 more)

### Community 49 - "session-knowledge-routes.ts"
Cohesion: 0.13
Nodes (17): Lineage, registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession() (+9 more)

### Community 50 - "noTmuxServer"
Cohesion: 0.11
Nodes (16): processAncestors(), tmuxTargetForPid(), noTmuxServer(), processGone(), procVisible(), socketIdentity(), directories, { execute } (+8 more)

### Community 51 - "transcription-service.ts"
Cohesion: 0.10
Nodes (20): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+12 more)

### Community 52 - "session-presentation.ts"
Cohesion: 0.15
Nodes (21): attentionRank, computerTone(), executionModeName(), recentFirst(), sessionActivityTime(), sessionDay, SessionSort, sessionSortFrom() (+13 more)

### Community 53 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 54 - "session-store.ts"
Cohesion: 0.09
Nodes (18): PendingTerminalQueueSettlement, TerminalDiscoveryError, activityDuration(), activityResultPreview(), archivedMessage(), DiscoveredSession, emptyRetirements, PendingChange (+10 more)

### Community 55 - "delegated-transcription-service.ts"
Cohesion: 0.13
Nodes (11): BuildAppOptions, collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation (+3 more)

### Community 56 - "session-resource-clear.test.ts"
Cohesion: 0.09
Nodes (21): apps, directories, directory(), obstructUploads(), pairedFixture(), providers, seed(), sockets (+13 more)

### Community 57 - "NewSessionDialog"
Cohesion: 0.14
Nodes (23): activateSession(), createSession(), executeCommand(), getProviderRuntimeOptions(), listDirectories(), listHistory(), listWorkspace(), validateSessionDirectory() (+15 more)

### Community 58 - "session-reply-durability.test.ts"
Cohesion: 0.16
Nodes (18): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRequest() (+10 more)

### Community 59 - "capture-workspace.ts"
Cohesion: 0.20
Nodes (20): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+12 more)

### Community 60 - "ResourceReads"
Cohesion: 0.13
Nodes (13): ActiveClaudeQuery, releases, session, snapshot, readClaudeMcp(), readCopilotResource(), copilotTransport(), disposals (+5 more)

### Community 61 - "session-clear-transcript.test.ts"
Cohesion: 0.11
Nodes (9): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions, disk, fixtures, gate(), holdTurnWrite() (+1 more)

### Community 62 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 63 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 64 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 65 - "directory-browser.ts"
Cohesion: 0.23
Nodes (11): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin(), SessionDirectoryError (+3 more)

### Community 66 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 67 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (8): claude(), clearFixture(), copilot(), disk, event(), fixtures, releases, sdkSession()

### Community 68 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 69 - "NodeIdentityStore"
Cohesion: 0.18
Nodes (4): ComputerRegistry, directories, remoteSnapshotFixture(), NodeIdentityStore

### Community 70 - "use-session-knowledge-root.ts"
Cohesion: 0.19
Nodes (12): getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey(), knowledgePositionForBinding(), SessionIdentity (+4 more)

### Community 71 - "recordValue"
Cohesion: 0.20
Nodes (17): addActivity(), boundedText(), errorValue(), notificationKind(), parsedValue(), recordValue(), shellExitFromValue(), shellIdFromFooter() (+9 more)

### Community 72 - "api.test.ts"
Cohesion: 0.21
Nodes (14): HUB_SNAPSHOT_TIMEOUT_MS, sendMessage(), failWith(), sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), currentSessionEventSequence(), nextSessionEventSequence() (+6 more)

### Community 73 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 74 - "workspace-fixtures.ts"
Cohesion: 0.16
Nodes (14): CONTEXT_EXAMPLE, documents, FIXTURE_NOW, fixtureBackgroundTasks, fixtureEndpoints, fixtureKnowledgeListings, fixtureKnowledgePositions, fixtureKnowledgeRoots (+6 more)

### Community 75 - "background-task-stop.test.ts"
Cohesion: 0.21
Nodes (13): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), snapshot() (+5 more)

### Community 76 - "queued-dispatch.test.ts"
Cohesion: 0.14
Nodes (9): accept(), deferred(), disk, fixture(), fixtures, holdWrite(), prompt(), releases (+1 more)

### Community 77 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 78 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 79 - "SessionNavigation.test.tsx"
Cohesion: 0.17
Nodes (13): SessionFilter, sessionNavigationView, matchesSessionSearch(), sessionPresentation, actions, backgroundTasks, computers, NavigationHarness() (+5 more)

### Community 80 - "check-workspace-review-regressions.ts"
Cohesion: 0.14
Nodes (12): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+4 more)

### Community 81 - "ComputerSummary"
Cohesion: 0.23
Nodes (5): fixture(), session(), sessionAtLeastAsNew(), RegisteredComputer, ComputerSummary

### Community 82 - "capture"
Cohesion: 0.20
Nodes (14): releaseRecording(), shortcutKeys(), stopRecording(), binding(), bindingLabel(), capturableCode(), isModifierCode(), keyLabel() (+6 more)

### Community 83 - "SessionResources.tsx"
Cohesion: 0.17
Nodes (9): KnowledgeRootSelector(), root, providerName(), shortPath(), Catalog, CatalogResult, SessionResources(), sourceLabels (+1 more)

### Community 84 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 85 - "BackgroundTasksDialog.tsx"
Cohesion: 0.23
Nodes (10): DialogFrame(), BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive() (+2 more)

### Community 86 - "capture-workbench-review.ts"
Cohesion: 0.17
Nodes (10): frame(), geometry, output, scratch, screenshot(), { values }, fixtureSessions, IDLE_SESSION_ID (+2 more)

### Community 87 - "package.json"
Cohesion: 0.15
Nodes (11): directory, { values }, workflows, name, packageManager, pnpm, onlyBuiltDependencies, private (+3 more)

### Community 88 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 89 - "push-notification-service.ts"
Cohesion: 0.15
Nodes (10): brief(), PushSender, PushState, directories, RFC-8030, RFC-8030, sessionMuteSchema, subscriptionSchema (+2 more)

### Community 90 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 91 - "react"
Cohesion: 0.20
Nodes (8): plugins, oxc, react, typescript, drawDiagram(), drawing, MermaidDiagram(), SessionActions()

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

### Community 97 - "setupWorkspaceFixture"
Cohesion: 0.24
Nodes (6): pageFor(), createWorkspaceFixtureState(), fixtureBaseUrl(), fixtureValue(), setupWorkspaceFixture(), fixtureApi()

### Community 98 - ".oxlintrc.json"
Cohesion: 0.20
Nodes (9): ignorePatterns, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/**, graphify/.venv/** (+1 more)

### Community 99 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 101 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 102 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 103 - "KnowledgePosition"
Cohesion: 0.36
Nodes (4): WorkspaceFixtureOptions, KnowledgePosition, KnowledgeRestoreState, base

### Community 105 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 106 - "deleteKnowledgeRoot"
Cohesion: 0.32
Nodes (8): addComputer(), deleteKnowledgeRoot(), removeComputer(), requestVoid(), removeRoot(), ComputersDialog(), remove(), submit()

### Community 107 - "recovery-context.ts"
Cohesion: 0.38
Nodes (4): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief

### Community 108 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 109 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 110 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 111 - "session-navigation-view.test.ts"
Cohesion: 0.33
Nodes (5): computers, first, grouped, hidden, last

### Community 112 - "api-origin.test.ts"
Cohesion: 0.40
Nodes (4): prefixes, session, trusted, untrusted

## Knowledge Gaps
- **663 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+658 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1003 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `SessionDetail`, `directory-browser.ts`, `agent-service.ts`, `SessionFileUpload`, `session-resources.ts`, `.clearSerialized`, `claude-agent-service.ts`, `.publishError`, `TerminalSessionController`, `queued-provider-dispatch.test.ts`, `session-store.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `RemoteNodeClient` connect `RemoteNodeClient` to `contracts.ts`, `SessionFileUpload`, `session-resources.ts`, `claude-agent-service.ts`, `remote-node-client.ts`, `TerminalSessionController`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionDetail` to `AgentService`, `ClaudeAgentService`, `SessionFileUpload`, `.clearSerialized`, `.publishError`, `TerminalSessionController`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _663 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `SessionDetail` be split into smaller, more focused modules?**
  _Cohesion score 0.05088495575221239 - nodes in this community are weakly interconnected._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.06258043758043758 - nodes in this community are weakly interconnected._
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
