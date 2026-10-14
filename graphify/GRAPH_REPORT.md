# Agentic Remote - Graphify code map

Snapshot: `3f539f4bf4e0052e988fe5dec02af8baabe42bff6601cecdc37a78960afce974`

Source checkout: `0e567c3d80fd14636c2b7eaefa3281e58430fb26`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 238 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 238 files · ~492,306 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3621 nodes · 10250 edges · 144 communities (105 shown, 24 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 744 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- SessionDetail
- App.tsx
- SessionStore
- api.ts
- App
- contracts.ts
- background-task-adapter.ts
- claude-agent-service.ts
- ComputerManager
- app.ts
- CopilotSessionLike
- markdown-navigation.ts
- agentic-remote-promotion-monitor
- terminal-session.ts
- submitMessage
- terminal-session.test.ts
- agent-service.ts
- transcription-service.ts
- TmuxTerminalSessionController
- bundle
- .publicSession
- pwa.ts
- SessionService
- FakeSessionService
- lib.rs
- shell.ts
- session-knowledge-routes.test.ts
- RemoteNodeClient
- PushNotificationService
- config.rs
- hub-routes.ts
- ProviderSessionService
- registerHubRoutes
- devDependencies
- session-resource-providers.test.ts
- agentic-remote
- agentic-remote-promotion-setup
- active-sessions.ts
- dependencies
- tmux-errors.integration.test.ts
- TerminalSessionController
- CopilotClientLike
- KnowledgeStore
- SessionKnowledgeStore
- scripts
- .handleSessionEvent
- compilerOptions
- session-resource-clear.test.ts
- NewSessionDialog
- capture-workspace.ts
- .sendInternal
- knowledge-tree.ts
- compilerOptions
- SessionKnowledgeBinding
- session-reply-durability.test.ts
- session-store-providers.test.ts
- isTerminalComposerFooter
- compilerOptions
- compilerOptions
- event-log.ts
- workspace-browser.ts
- normalizeKnowledgeRelativePath
- react
- session-directory.ts
- BackgroundTaskSnapshot
- session-knowledge-store.ts
- SessionNavigation.tsx
- server/side-question.ts
- SessionResources.tsx
- ReaderWorkspace
- workspace-fixtures.ts
- recovery-resend-durability.test.ts
- session-resource-routes.test.ts
- session-presentation.ts
- check-workspace-review-regressions.ts
- desktop.json
- BackgroundTasksDialog.tsx
- capture-workbench-review.ts
- settings-local.json
- registerSessionKnowledgeRoutes
- session-response-order.ts
- SessionNavigation.test.tsx
- scripts
- promotion-monitor.test.ts
- recovery-seed-guards.test.ts
- SessionAdmissions
- html-preview.ts
- session-knowledge-routes.ts
- composerHoldsText
- setupWorkspaceFixture
- .oxlintrc.json
- node:fs/promises
- generate-pwa-icons.ts
- bridge.rs
- screenshot-stability.test.ts
- KnowledgePosition
- remote-node-client.test.ts
- session-clear-transcript.test.ts
- session-knowledge-store.test.ts
- package.json
- SessionFileUpload
- release-publication.test.ts
- agent-service.test.ts
- recovery-context.ts
- settings.ts
- composer-layout.test.ts
- session-navigation-view.test.ts
- hasRunningBackgroundAgent
- removeComputer
- .discoverTerminalSessions
- promotion-setup-execution.test.ts
- terminal-send-uncertainty.test.ts
- version-policy.test.ts
- MermaidDiagram.test.tsx
- sideQuestionCommand
- tsconfig.json
- vite.config.ts
- ffprobe-static
- mermaid
- react
- react-dom
- remark-gfm
- unified
- web-push
- zod
- sw.js
- recovery-question-styles.test.ts
- agentic-remote-shell

## God Nodes (most connected - your core abstractions)
1. `SessionDetail` - 276 edges
2. `App()` - 255 edges
3. `AgentService` - 227 edges
4. `SessionStore` - 157 edges
5. `ClaudeAgentService` - 118 edges
6. `ComputerManager` - 81 edges
7. `registerHubRoutes()` - 76 edges
8. `SessionService` - 71 edges
9. `RemoteNodeClient` - 66 edges
10. `TmuxTerminalSessionController` - 61 edges

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

## Communities (144 total, 24 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.05
Nodes (10): agentMode(), AgentService, isMissingSessionError(), isUncertainDelivery(), removeCopilotSessionFiles(), RuntimeConfigurationError, statusFromEvents(), preparePrompt() (+2 more)

### Community 1 - "SessionDetail"
Cohesion: 0.04
Nodes (10): ClaudeAgentService, isMissingClaudeSessionError(), observe(), copilotRequest(), claudeFixture(), clearRecoverySeedFailure(), QueuedPromptReservation, QueuedPrompt (+2 more)

### Community 2 - "App.tsx"
Cohesion: 0.03
Nodes (103): configureRuntime(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph() (+95 more)

### Community 3 - "SessionStore"
Cohesion: 0.04
Nodes (61): fixture(), holdProbe(), fixtures, gate(), releases, fixture(), cleanupFixtures(), directories (+53 more)

### Community 4 - "api.ts"
Cohesion: 0.04
Nodes (96): httpDeliveryUncertain(), legacyDefinitiveHttpRefusals, parseSubmissionReceipt(), submissionReceiptFromError(), addKnowledgeRoot(), bootstrapSessionOrder(), cancelBackgroundTask(), cancelSession() (+88 more)

### Community 5 - "App"
Cohesion: 0.04
Nodes (101): askSession(), listKnowledgeEntries(), readKnowledgeFile(), recoverConversation(), resumeSession(), saveSessionOrderLane(), setSessionNotificationsMuted(), suspendSession() (+93 more)

### Community 6 - "contracts.ts"
Cohesion: 0.04
Nodes (46): ClaudeAgentServiceEvents, DirectoryScope, directories, routingFixture(), session(), temporaryDirectory(), AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER (+38 more)

### Community 7 - "background-task-adapter.ts"
Cohesion: 0.05
Nodes (74): DeferredSession, addActivity(), attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), boundedText() (+66 more)

### Community 8 - "claude-agent-service.ts"
Cohesion: 0.06
Nodes (58): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission (+50 more)

### Community 9 - "ComputerManager"
Cohesion: 0.06
Nodes (19): ComputerManager, managedSession(), RemoteSessionListing, RemoteSessionRead, sessionAtLeastAsNew(), SessionMetadataLookup, RegisteredComputer, FakeManager (+11 more)

### Community 10 - "app.ts"
Cohesion: 0.04
Nodes (50): prefixes, session, trusted, untrusted, buildApp(), BuildAppOptions, errorStatusCode(), isAppleTouchIconProbe() (+42 more)

### Community 11 - "CopilotSessionLike"
Cohesion: 0.04
Nodes (33): CopilotSessionLike, configurableModel(), FakeCopilotClient, startupFifoFixture(), terminalService(), CopilotTasksApi, acceptanceReceipt(), errorMessage() (+25 more)

### Community 12 - "markdown-navigation.ts"
Cohesion: 0.05
Nodes (57): UserInputField, UserInputFieldValue, followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), MarkdownImage(), missingDocumentFragment(), WorkspaceDialog() (+49 more)

### Community 13 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (67): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+59 more)

### Community 14 - "terminal-session.ts"
Cohesion: 0.07
Nodes (59): TerminalFormContinuation, activeBottomFrame(), cleanDialogLine(), clearAutomaticStartupPrompts(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFocusWitnessed(), containsCopiedInteractiveFrame() (+51 more)

### Community 15 - "submitMessage"
Cohesion: 0.07
Nodes (61): getSession(), activeComposerPastes(), applySession(), cancelQueuedPromptEdit(), clearSelectedConversation(), composerChanged(), composerKeyDown(), composerPasted() (+53 more)

### Community 16 - "terminal-session.test.ts"
Cohesion: 0.06
Nodes (47): exec, formFixture(), horizontalFormFixture(), textFieldFormFixture(), directories, exec, parseTerminalUpdateNotice(), bracketedTabPane (+39 more)

### Community 17 - "agent-service.ts"
Cohesion: 0.05
Nodes (51): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), AgentServiceEvents, ansiSequence, commandShortcut(), CreationRuntime (+43 more)

### Community 18 - "transcription-service.ts"
Cohesion: 0.06
Nodes (32): directory, { values }, workflows, pnpm, onlyBuiltDependencies, ffmpeg-static, collect(), oversized() (+24 more)

### Community 19 - "TmuxTerminalSessionController"
Cohesion: 0.11
Nodes (13): copilotCommand(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand(), safeWindowName(), submitTerminalForm(), terminalChecklistState() (+5 more)

### Community 20 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 22 - "pwa.ts"
Cohesion: 0.09
Nodes (37): directories, AppVersion, parseAppVersion(), deletePushSubscription(), getProviderRuntimeOptions(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate() (+29 more)

### Community 23 - "SessionService"
Cohesion: 0.08
Nodes (11): registerNodeRoutes(), releases, session, snapshot, readServiceResources(), readSessionSkills(), ResourceReads, resourceRequestHandler() (+3 more)

### Community 25 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 26 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 27 - "session-knowledge-routes.test.ts"
Cohesion: 0.08
Nodes (20): ServerRole, ComputerManagerEvents, fixture(), managers, releases, remote, session(), ComputerRegistry (+12 more)

### Community 28 - "RemoteNodeClient"
Cohesion: 0.08
Nodes (6): RemoteResync, headerSafe(), RemoteNodeClient, NodeInfo, RemovedQueuedPrompt, WorkspaceListing

### Community 29 - "PushNotificationService"
Cohesion: 0.11
Nodes (13): brief(), HubEventSource, PushNotificationService, PushSender, PushState, directories, RFC-8030, RFC-8030 (+5 more)

### Community 30 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 31 - "hub-routes.ts"
Cohesion: 0.06
Nodes (37): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+29 more)

### Community 33 - "registerHubRoutes"
Cohesion: 0.13
Nodes (14): registerHubRoutes(), SessionMuteCarrier, directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane() (+6 more)

### Community 34 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 35 - "session-resource-providers.test.ts"
Cohesion: 0.07
Nodes (29): ClaudeSdk, deferred(), disk, enqueue(), fixtures, holdAdmissionWrite(), releases, disk (+21 more)

### Community 36 - "agentic-remote"
Cohesion: 0.13
Nodes (31): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+23 more)

### Community 37 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (30): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+22 more)

### Community 38 - "active-sessions.ts"
Cohesion: 0.14
Nodes (29): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+21 more)

### Community 39 - "dependencies"
Cohesion: 0.06
Nodes (31): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/static, @fastify/websocket (+23 more)

### Community 40 - "tmux-errors.integration.test.ts"
Cohesion: 0.09
Nodes (21): execFileAsync, headers, ignoreMissing(), removeFixture(), seedSession(), sessionLog(), stopOwnedServer(), noTmuxServer() (+13 more)

### Community 41 - "TerminalSessionController"
Cohesion: 0.13
Nodes (4): persistedFormAnswer(), TerminalSessionController, PendingUserInput, SessionStatus

### Community 42 - "CopilotClientLike"
Cohesion: 0.08
Nodes (12): CopilotClientLike, directories, fakeClient(), ForkRequest, forkSession(), services, fixtures, recoverAndSeed() (+4 more)

### Community 43 - "KnowledgeStore"
Cohesion: 0.16
Nodes (8): WorkspaceFixtureState, KnowledgeRootReservation, KnowledgeState, KnowledgeStore, directories, fixture(), createHub(), KnowledgeRoot

### Community 44 - "SessionKnowledgeStore"
Cohesion: 0.15
Nodes (6): bindingKey(), SessionKnowledgeRecoveryError, SessionKnowledgeStore, stateSchema, stateWithPaths(), UpdateSessionKnowledgeRootInput

### Community 45 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 46 - ".handleSessionEvent"
Cohesion: 0.21
Nodes (19): activityKind(), activityResult(), ActivityToolStart, contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), isBackgroundTaskEvent() (+11 more)

### Community 47 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 48 - "session-resource-clear.test.ts"
Cohesion: 0.11
Nodes (19): apps, directories, directory(), pairedFixture(), providers, seed(), sockets, stores (+11 more)

### Community 49 - "NewSessionDialog"
Cohesion: 0.15
Nodes (22): activateSession(), createSession(), executeCommand(), listDirectories(), listHistory(), listWorkspace(), validateSessionDirectory(), AddKnowledgeRootDialog() (+14 more)

### Community 50 - "capture-workspace.ts"
Cohesion: 0.20
Nodes (20): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+12 more)

### Community 51 - ".sendInternal"
Cohesion: 0.23
Nodes (11): capturePane(), hasLiveTerminalComposer(), isTerminalAgentWorking(), isTerminalOverlay(), isTerminalSessionInUsePrompt(), isTerminalVisiblyIdle(), parseTerminalFormPrompt(), parseTerminalUserInput() (+3 more)

### Community 52 - "knowledge-tree.ts"
Cohesion: 0.17
Nodes (18): WorkspaceEntry, knowledgeTreeKeyDown(), toggleKnowledgeFolder(), collapseKnowledgeFolder(), expandKnowledgeFolder(), knowledgeAncestors(), KnowledgeCrumb, knowledgeCrumbs() (+10 more)

### Community 53 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 54 - "SessionKnowledgeBinding"
Cohesion: 0.18
Nodes (14): SessionKnowledgeEvents, SessionKnowledgeBinding, getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey() (+6 more)

### Community 55 - "session-reply-durability.test.ts"
Cohesion: 0.17
Nodes (16): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRunFixture() (+8 more)

### Community 56 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (9): claude(), clearFixture(), copilot(), disk, event(), fixtures, holdOtherWrite(), releases (+1 more)

### Community 57 - "isTerminalComposerFooter"
Cohesion: 0.15
Nodes (18): boxedComposerFrame(), captureTerminal(), composerFrameText(), composerHasFocus(), composerRowText(), cursorComposerFrame(), DownloadedUpdateCell, downloadedUpdateFooterBlock() (+10 more)

### Community 58 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 59 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 60 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 61 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 62 - "normalizeKnowledgeRelativePath"
Cohesion: 0.22
Nodes (15): joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath(), slashPath(), scopedKnowledgeRoot(), KnowledgeRootChoice (+7 more)

### Community 63 - "react"
Cohesion: 0.13
Nodes (11): plugins, oxc, react, typescript, MarkdownCodeBlock(), copy(), originalClipboard, drawDiagram() (+3 more)

### Community 64 - "session-directory.ts"
Cohesion: 0.21
Nodes (11): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin(), SessionDirectoryError (+3 more)

### Community 65 - "BackgroundTaskSnapshot"
Cohesion: 0.20
Nodes (7): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask, BackgroundTaskSnapshot

### Community 66 - "session-knowledge-store.ts"
Cohesion: 0.12
Nodes (16): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+8 more)

### Community 67 - "SessionNavigation.tsx"
Cohesion: 0.24
Nodes (15): sessionNavigationView, computerTone(), executionModeName(), matchesSessionSearch(), providerName(), sessionActivityTime(), sessionPresentation, sessionSortFrom() (+7 more)

### Community 68 - "server/side-question.ts"
Cohesion: 0.22
Nodes (10): SIDE_QUESTION_CLEANUP_MS, SIDE_QUESTION_RUNTIME_IDLE_MS, SIDE_QUESTION_TIMEOUT_MS, sideQuestionBoundary(), SideQuestionError, sideQuestionPrompt(), withSideQuestionTimeout(), SIDE_QUESTION_EARLIER_ANSWER_MAX_LENGTH (+2 more)

### Community 69 - "SessionResources.tsx"
Cohesion: 0.14
Nodes (11): SessionMcpServerSummary, SessionResourceSource, SessionSkillSummary, KnowledgeRootSelector(), root, shortPath(), Catalog, CatalogResult (+3 more)

### Community 70 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 71 - "workspace-fixtures.ts"
Cohesion: 0.16
Nodes (14): CONTEXT_EXAMPLE, documents, FIXTURE_NOW, fixtureBackgroundTasks, fixtureEndpoints, fixtureKnowledgeListings, fixtureKnowledgePositions, fixtureKnowledgeRoots (+6 more)

### Community 72 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 73 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 74 - "session-presentation.ts"
Cohesion: 0.19
Nodes (14): SessionExecutionMode, attentionRank, newSessionTitle(), orderSessionLane(), pendingSessionPlacements(), recentFirst(), SessionCreationDraft, sessionDay (+6 more)

### Community 75 - "check-workspace-review-regressions.ts"
Cohesion: 0.14
Nodes (12): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+4 more)

### Community 76 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 77 - "BackgroundTasksDialog.tsx"
Cohesion: 0.23
Nodes (10): DialogFrame(), BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive() (+2 more)

### Community 78 - "capture-workbench-review.ts"
Cohesion: 0.17
Nodes (10): frame(), geometry, output, scratch, screenshot(), { values }, fixtureSessions, IDLE_SESSION_ID (+2 more)

### Community 79 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 80 - "registerSessionKnowledgeRoutes"
Cohesion: 0.33
Nodes (11): registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession(), recordReplacement() (+3 more)

### Community 81 - "session-response-order.ts"
Cohesion: 0.27
Nodes (11): sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), currentSessionEventSequence(), nextSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences (+3 more)

### Community 82 - "SessionNavigation.test.tsx"
Cohesion: 0.15
Nodes (11): SessionFilter, SessionSort, actions, backgroundTasks, computers, NavigationHarness(), offline, question (+3 more)

### Community 83 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+4 more)

### Community 84 - "promotion-monitor.test.ts"
Cohesion: 0.30
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 85 - "recovery-seed-guards.test.ts"
Cohesion: 0.18
Nodes (8): bootLegacy(), directories, execute, pending, releases, SeedState, services, stores

### Community 86 - "SessionAdmissions"
Cohesion: 0.20
Nodes (4): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions

### Community 87 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 88 - "session-knowledge-routes.ts"
Cohesion: 0.18
Nodes (6): Lineage, RegistrationGeneration, ReplacementEvidence, SessionKnowledgeLifecycle, sessionParams, updateSchema

### Community 89 - "composerHoldsText"
Cohesion: 0.33
Nodes (11): composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), occurrences(), paneEvidenceCount(), paneShowsText(), pasteCouldCollapse() (+3 more)

### Community 90 - "setupWorkspaceFixture"
Cohesion: 0.24
Nodes (6): pageFor(), createWorkspaceFixtureState(), fixtureBaseUrl(), fixtureValue(), setupWorkspaceFixture(), fixtureApi()

### Community 91 - ".oxlintrc.json"
Cohesion: 0.20
Nodes (9): ignorePatterns, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/**, graphify/.venv/** (+1 more)

### Community 92 - "node:fs/promises"
Cohesion: 0.27
Nodes (7): disk, fixture(), fixtures, prompt(), ready(), releases, session()

### Community 93 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 94 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 95 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 96 - "KnowledgePosition"
Cohesion: 0.33
Nodes (5): WorkspaceFixtureOptions, KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 97 - "remote-node-client.test.ts"
Cohesion: 0.28
Nodes (5): client(), servers, session, TERMINAL_REQUEST_TIMEOUT_MS, TERMINAL_STARTUP_TIMEOUT_MS

### Community 98 - "session-clear-transcript.test.ts"
Cohesion: 0.25
Nodes (5): disk, fixtures, gate(), holdTurnWrite(), releases

### Community 99 - "session-knowledge-store.test.ts"
Cohesion: 0.25
Nodes (6): SessionKnowledgeConflictError, disk, fixture(), fixtures, releases, root()

### Community 100 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, packageManager, private, type, version

### Community 102 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 103 - "agent-service.test.ts"
Cohesion: 0.29
Nodes (5): terminalFormSteps(), directories, services, TerminalCancelOptions, UserInputForm

### Community 104 - "recovery-context.ts"
Cohesion: 0.38
Nodes (4): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief

### Community 105 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 106 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 107 - "session-navigation-view.test.ts"
Cohesion: 0.33
Nodes (5): computers, first, grouped, hidden, last

### Community 109 - "removeComputer"
Cohesion: 0.60
Nodes (5): addComputer(), removeComputer(), ComputersDialog(), remove(), submit()

## Knowledge Gaps
- **680 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+675 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1025 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **24 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `session-directory.ts`, `server/side-question.ts`, `SessionFileUpload`, `contracts.ts`, `background-task-adapter.ts`, `claude-agent-service.ts`, `TerminalSessionController`, `CopilotClientLike`, `CopilotSessionLike`, `.handleSessionEvent`, `.discoverTerminalSessions`, `.publicSession`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **Why does `connect()` connect `SessionStore` to `AgentService`, `SessionDetail`, `ProviderSessionService`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _680 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.05108359133126935 - nodes in this community are weakly interconnected._
- **Should `SessionDetail` be split into smaller, more focused modules?**
  _Cohesion score 0.043994500687414076 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.027871148459383755 - nodes in this community are weakly interconnected._
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
