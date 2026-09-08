# Agentic Remote - Graphify code map

Snapshot: `721f0e9b3f04a0adbc65205e4813c64d56f845927173cde48b4b281556b5ddd4`

Source checkout: `df8e394d203b94e00eaa719b01e70733f2e3808c`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 143 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 143 files · ~352,502 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2709 nodes · 7460 edges · 117 communities (82 shown, 21 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 578 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App.tsx
- App
- background-task-adapter.ts
- api.ts
- contracts.ts
- SessionDetail
- RemoteNodeClient
- agentic-remote-promotion-monitor
- ComputerManager
- ClaudeAgentService
- AgentService
- hub-routes.ts
- terminal-session.ts
- agent-service.ts
- terminal-session.test.ts
- bundle
- TmuxTerminalSessionController
- .get
- lib.rs
- .readAfterWrites
- ProviderSessionService
- shell.ts
- SessionService
- config.rs
- pwa.ts
- .create
- FakeSessionService
- devDependencies
- agentic-remote
- WorkspaceDialog
- dependencies
- agentic-remote-promotion-setup
- node-routes.ts
- knowledge-tree.ts
- TerminalSessionController
- scripts
- .handleSessionEvent
- claude-agent-service.ts
- queued-provider-dispatch.test.ts
- PushNotificationService
- compilerOptions
- session-store-providers.test.ts
- active-sessions.ts
- CopilotSessionLike
- session-reply-durability.test.ts
- session-store.ts
- tmux-errors.integration.test.ts
- transcription-service.ts
- NewSessionDialog
- CopilotClientLike
- session-clear-transcript.test.ts
- compilerOptions
- app.ts
- ComputerRegistry
- compilerOptions
- compilerOptions
- delegated-transcription-service.ts
- event-log.ts
- workspace-browser.ts
- .dispatchAdmitted
- directory-browser.ts
- agent-service.test.ts
- recovery-resend-durability.test.ts
- capture
- BackgroundTaskSnapshot
- desktop.json
- queued-dispatch.test.ts
- .oxlintrc.json
- settings-local.json
- .acknowledgeFailedPrompt
- TranscriptionError
- composerPasted
- promotion-monitor.test.ts
- scripts
- TranscriptionService
- push-notification-service.ts
- composerHoldsText
- SessionFileUpload
- session-enqueue-clear.test.ts
- bridge.rs
- package.json
- UserInputFieldControl
- settings.ts
- knowledge-restore.ts
- release-publication.test.ts
- composer-layout.test.ts
- removeComputer
- MockMediaRecorder
- MermaidDiagram.tsx
- MockWebSocket
- MermaidDiagram.test.tsx
- tsconfig.json
- vite.config.ts
- ffmpeg-static
- lucide-react
- mermaid
- pdfjs-dist
- react-markdown
- remark-gfm
- ws
- zod
- sw.js
- agentic-remote-shell

## God Nodes (most connected - your core abstractions)
1. `SessionDetail` - 247 edges
2. `App()` - 196 edges
3. `AgentService` - 189 edges
4. `SessionStore` - 130 edges
5. `ClaudeAgentService` - 107 edges
6. `ComputerManager` - 70 edges
7. `RemoteNodeClient` - 58 edges
8. `SessionService` - 58 edges
9. `registerHubRoutes()` - 53 edges
10. `TmuxTerminalSessionController` - 50 edges

## Surprising Connections (you probably didn't know these)
- `submit()` --indirect_call--> `provider()`  [INFERRED]
  src/App.tsx → server/provider-session-service.test.ts
- `AcceptedSdkReply` --references--> `SessionDetail`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `ClaudeAgentServiceEvents` --references--> `ServerEvent`  [EXTRACTED]
  server/claude-agent-service.ts → shared/contracts.ts
- `PendingClaudeReply` --references--> `SessionDetail`  [EXTRACTED]
  server/claude-agent-service.ts → shared/contracts.ts
- `RemoteSessionListing` --references--> `ManagedSession`  [EXTRACTED]
  server/computer-manager.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (117 total, 21 thin omitted)

### Community 0 - "App.tsx"
Cohesion: 0.03
Nodes (95): applyAccentIcon(), configureRuntime(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage() (+87 more)

### Community 1 - "App"
Cohesion: 0.05
Nodes (101): deleteKnowledgeRoot(), App(), answerUserInput(), appendComposerForKey(), appKeyDown(), applyComputerSnapshot(), applySession(), attachedFiles() (+93 more)

### Community 2 - "background-task-adapter.ts"
Cohesion: 0.06
Nodes (67): DeferredSession, addActivity(), attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), boundedText() (+59 more)

### Community 3 - "api.ts"
Cohesion: 0.06
Nodes (68): parseSubmissionReceipt(), submissionReceiptFromError(), cancelBackgroundTask(), cancelSession(), clearConversation(), deleteSession(), dispatchQueuedPrompt(), getProviderRuntimeOptions() (+60 more)

### Community 4 - "contracts.ts"
Cohesion: 0.05
Nodes (41): AgentServiceEvents, CreationRuntime, ComputerManagerEvents, RemoteResync, RemoteSessionListing, RemoteSessionRead, DirectoryScope, directories (+33 more)

### Community 5 - "SessionDetail"
Cohesion: 0.08
Nodes (6): observe(), SessionStore, ChatMessage, QueuedPrompt, SessionDetail, SessionStatus

### Community 6 - "RemoteNodeClient"
Cohesion: 0.04
Nodes (25): AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, DEFINITE_DISPATCH_REFUSALS, headerSafe(), REDIRECT_STATUSES, RemoteNodeClient, RemoteNodeClientEvents, RemoteNodeRedirectError (+17 more)

### Community 7 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (67): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+59 more)

### Community 8 - "ComputerManager"
Cohesion: 0.12
Nodes (11): ComputerManager, managedSession(), sessionAtLeastAsNew(), RegisteredComputer, registerHubRoutes(), normalizeNodeUrl(), AddComputerInput, ComputerSummary (+3 more)

### Community 9 - "ClaudeAgentService"
Cohesion: 0.07
Nodes (4): ClaudeAgentService, isMissingClaudeSessionError(), toolResultText(), RuntimeModelOption

### Community 10 - "AgentService"
Cohesion: 0.07
Nodes (5): AgentService, RuntimeConfigurationError, fixture(), httpBoundary(), TranscriptObservation

### Community 11 - "hub-routes.ts"
Cohesion: 0.06
Nodes (32): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+24 more)

### Community 12 - "terminal-session.ts"
Cohesion: 0.12
Nodes (41): activeBottomFrame(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), COMPOSER_PLACEHOLDERS, containsCopiedInteractiveFrame(), desktopInstallPromptIdentity(), findTerminalWrappedText() (+33 more)

### Community 13 - "agent-service.ts"
Cohesion: 0.05
Nodes (43): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), ActivityToolStart, ansiSequence, commandShortcut(), DeliveryBoundary (+35 more)

### Community 14 - "terminal-session.test.ts"
Cohesion: 0.08
Nodes (36): directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), directories, exec, parseTerminalUpdateNotice() (+28 more)

### Community 15 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 16 - "TmuxTerminalSessionController"
Cohesion: 0.12
Nodes (12): processAdapter, copilotCommand(), execFileAsync, processAncestors(), processCommand(), submitTerminalForm(), terminalChecklistState(), terminalFormCommitKeys() (+4 more)

### Community 17 - ".get"
Cohesion: 0.14
Nodes (3): agentMode(), isMissingSessionError(), removeCopilotSessionFiles()

### Community 18 - "lib.rs"
Cohesion: 0.14
Nodes (35): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+27 more)

### Community 21 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 23 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 24 - "pwa.ts"
Cohesion: 0.11
Nodes (34): react, deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate() (+26 more)

### Community 25 - ".create"
Cohesion: 0.08
Nodes (29): fixture(), holdProbe(), fixtures, gate(), releases, connect(), createStore(), enqueue() (+21 more)

### Community 26 - "FakeSessionService"
Cohesion: 0.08
Nodes (4): FakeSessionService, routingFixture(), session(), temporaryDirectory()

### Community 27 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 28 - "agentic-remote"
Cohesion: 0.14
Nodes (30): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+22 more)

### Community 29 - "WorkspaceDialog"
Cohesion: 0.12
Nodes (29): followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), MarkdownImage(), missingDocumentFragment(), WorkspaceDialog(), moveHere(), navigateDocument() (+21 more)

### Community 30 - "dependencies"
Cohesion: 0.06
Nodes (31): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/static, @fastify/websocket (+23 more)

### Community 31 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (28): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+20 more)

### Community 32 - "node-routes.ts"
Cohesion: 0.09
Nodes (24): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile(), configureRuntimeSchema, createSessionSchema (+16 more)

### Community 33 - "knowledge-tree.ts"
Cohesion: 0.12
Nodes (25): WorkspaceEntry, addKnowledgeRoot(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeTreeKeyDown(), loadKnowledgeChain(), loadKnowledgeFolder() (+17 more)

### Community 34 - "TerminalSessionController"
Cohesion: 0.11
Nodes (4): isForegroundCompletionEvent(), isForegroundLifecycleEvent(), statusFromEvents(), TerminalSessionController

### Community 35 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 36 - ".handleSessionEvent"
Cohesion: 0.19
Nodes (21): activityKind(), activityResult(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), isBackgroundTaskEvent(), isRuntimeReasoningEffort() (+13 more)

### Community 37 - "claude-agent-service.ts"
Cohesion: 0.14
Nodes (17): ActiveClaudeQuery, AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, execFileAsync, PendingClaudeInput, PendingClaudePermission, PendingClaudeReply (+9 more)

### Community 38 - "queued-provider-dispatch.test.ts"
Cohesion: 0.10
Nodes (14): ClaudeSdk, directories, fixture(), queryHandle(), waitForIdle(), claudeFixture(), copilotFixture(), copilotSession() (+6 more)

### Community 39 - "PushNotificationService"
Cohesion: 0.19
Nodes (3): HubEventSource, PushNotificationService, registerPushRoutes()

### Community 40 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 41 - "session-store-providers.test.ts"
Cohesion: 0.09
Nodes (10): disk, fixtures, prompt(), ready(), releases, session(), claude(), disk (+2 more)

### Community 42 - "active-sessions.ts"
Cohesion: 0.19
Nodes (23): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+15 more)

### Community 43 - "CopilotSessionLike"
Cohesion: 0.13
Nodes (10): CopilotSessionLike, CopilotTasksApi, isClaudeAuthenticationError(), acceptanceReceipt(), QueuedDelivery, accept(), unknownClaim(), queuedSdkPrompt() (+2 more)

### Community 44 - "session-reply-durability.test.ts"
Cohesion: 0.15
Nodes (15): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRequest() (+7 more)

### Community 45 - "session-store.ts"
Cohesion: 0.09
Nodes (18): activityDuration(), activityResultPreview(), DiscoveredSession, emptyRetirements, PendingChange, PendingMutation, RecoveryResend, SdkQueueAdmission (+10 more)

### Community 46 - "tmux-errors.integration.test.ts"
Cohesion: 0.12
Nodes (19): execFileAsync, headers, ignoreMissing(), removeFixture(), seedSession(), sessionLog(), stopOwnedServer(), noTmuxServer() (+11 more)

### Community 47 - "transcription-service.ts"
Cohesion: 0.11
Nodes (19): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+11 more)

### Community 48 - "NewSessionDialog"
Cohesion: 0.14
Nodes (23): activateSession(), createSession(), executeCommand(), listDirectories(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), moveSessionToBrowsedFolder() (+15 more)

### Community 49 - "CopilotClientLike"
Cohesion: 0.10
Nodes (12): CopilotClientLike, deferred(), disk, fixtures, holdClaimWrite(), releases, deferred(), disk (+4 more)

### Community 50 - "session-clear-transcript.test.ts"
Cohesion: 0.11
Nodes (9): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions, disk, fixtures, gate(), holdTurnWrite() (+1 more)

### Community 51 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 52 - "app.ts"
Cohesion: 0.15
Nodes (13): prefixes, session, trusted, untrusted, directories, buildApp(), errorStatusCode(), ServerRole (+5 more)

### Community 53 - "ComputerRegistry"
Cohesion: 0.16
Nodes (5): ComputerRegistry, RegistryState, directories, remoteSnapshotFixture(), NodeIdentityStore

### Community 54 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 55 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 57 - "delegated-transcription-service.ts"
Cohesion: 0.16
Nodes (10): collect(), DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, AudioUpload, MAX_AUDIO_BYTES (+2 more)

### Community 58 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 59 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 60 - ".dispatchAdmitted"
Cohesion: 0.21
Nodes (3): preparePrompt(), QueuedPromptReservation, QueuedPromptDispatchResult

### Community 61 - "directory-browser.ts"
Cohesion: 0.28
Nodes (11): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin(), SessionDirectoryError (+3 more)

### Community 62 - "agent-service.test.ts"
Cohesion: 0.15
Nodes (7): terminalFormSteps(), configurableModel(), directories, FakeCopilotClient, services, startupFifoFixture(), UserInputForm

### Community 63 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 64 - "capture"
Cohesion: 0.18
Nodes (15): releaseRecording(), shortcutKeys(), startRecording(), stopRecording(), binding(), bindingLabel(), capturableCode(), isModifierCode() (+7 more)

### Community 65 - "BackgroundTaskSnapshot"
Cohesion: 0.24
Nodes (7): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask, BackgroundTaskSnapshot

### Community 66 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 67 - "queued-dispatch.test.ts"
Cohesion: 0.15
Nodes (7): deferred(), disk, fixtures, holdWrite(), prompt(), releases, target

### Community 68 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 69 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 71 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 72 - "composerPasted"
Cohesion: 0.31
Nodes (13): activeComposerPastes(), composerChanged(), composerPasted(), isWebOnlyCommand(), queuedEditSubmission(), applyComposerEdit(), collapsedPasteLabel(), composerInputValue() (+5 more)

### Community 73 - "promotion-monitor.test.ts"
Cohesion: 0.30
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 74 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, check, dev, dev:server, dev:web, lint, start (+3 more)

### Community 75 - "TranscriptionService"
Cohesion: 0.25
Nodes (5): BuildAppOptions, DelegatedTranscriptionOptions, registerTranscriptionRoutes(), transcriptionMultipartOptions, TranscriptionService

### Community 76 - "push-notification-service.ts"
Cohesion: 0.18
Nodes (8): brief(), PushSender, PushState, directories, sessionMuteSchema, subscriptionSchema, testNotificationSchema, unsubscribeSchema

### Community 77 - "composerHoldsText"
Cohesion: 0.33
Nodes (11): composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), occurrences(), paneEvidenceCount(), paneShowsText(), pasteCouldCollapse() (+3 more)

### Community 79 - "session-enqueue-clear.test.ts"
Cohesion: 0.29
Nodes (9): disk, EnqueueCase, fixtures, gate(), holdEnqueue(), joinedEnqueue(), quiet(), releases (+1 more)

### Community 80 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 81 - "package.json"
Cohesion: 0.22
Nodes (8): name, packageManager, pnpm, onlyBuiltDependencies, private, type, version, ffmpeg-static

### Community 82 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 83 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 84 - "knowledge-restore.ts"
Cohesion: 0.43
Nodes (3): KnowledgePosition, KnowledgeRestoreState, base

### Community 85 - "release-publication.test.ts"
Cohesion: 0.40
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 87 - "removeComputer"
Cohesion: 0.60
Nodes (5): addComputer(), removeComputer(), ComputersDialog(), remove(), submit()

### Community 90 - "MermaidDiagram.tsx"
Cohesion: 0.67
Nodes (3): drawDiagram(), drawing, MermaidDiagram()

## Knowledge Gaps
- **477 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+472 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 736 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `TerminalSessionController`, `.handleSessionEvent`, `contracts.ts`, `.acknowledgeFailedPrompt`, `claude-agent-service.ts`, `SessionFileUpload`, `.get`, `.readAfterWrites`, `ProviderSessionService`, `.syncTranscripts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionService` connect `SessionService` to `SessionFileUpload`, `contracts.ts`, `ProviderSessionService`, `RemoteNodeClient`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `RemoteNodeClient` connect `RemoteNodeClient` to `ComputerManager`, `BackgroundTaskSnapshot`, `contracts.ts`, `SessionFileUpload`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _477 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.029221882432891606 - nodes in this community are weakly interconnected._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.04854368932038835 - nodes in this community are weakly interconnected._
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
- `docs/mockups/activity-view.html`
- `docs/native-shell.md`
- `docs/provider-compatibility.md`
- `docs/sdk-architecture-roadmap.md`
- `docs/slash-command-feedback.md`
- `index.html`
- `public/apple-touch-icon-precomposed.png`
- `public/apple-touch-icon.png`
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
