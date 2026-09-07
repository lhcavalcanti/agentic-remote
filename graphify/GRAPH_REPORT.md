# Agentic Remote - Graphify code map

Snapshot: `8cda2c67d0323a0d5883d79b93159a0beffa7bea8a44a3ed2ad0ac46e27cc6bb`

Source checkout: `99f22c2f6f473385ea40a077e98163ed2ebaedcd`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 135 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 135 files · ~297,601 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2497 nodes · 6703 edges · 120 communities (78 shown, 28 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 521 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- ClaudeAgentService
- App
- App.tsx
- agentic-remote-promotion-monitor
- api.ts
- terminal-session.ts
- SessionDetail
- tmux-errors.integration.test.ts
- AgentService
- claude-agent-service.ts
- background-task-adapter.ts
- bundle
- lib.rs
- TmuxTerminalSessionController
- agent-service.ts
- contracts.ts
- shell.ts
- RemoteNodeClient
- config.rs
- WorkspaceDialog
- PushNotificationService
- pwa.ts
- SessionService
- ProviderSessionService
- devDependencies
- agentic-remote
- .get
- .readAfterWrites
- registerHubRoutes
- FakeSessionService
- dependencies
- agentic-remote-promotion-setup
- delegated-transcription-service.ts
- terminal-startup-queue.test.ts
- hub-routes.ts
- scripts
- claude-recovery-admission.test.ts
- directory-browser.ts
- terminal-session.test.ts
- knowledge-tree.ts
- session-store-providers.test.ts
- compilerOptions
- .handleSessionEvent
- transcription-service.ts
- agent-service.test.ts
- session-store.ts
- session-reply-durability.test.ts
- compilerOptions
- app.ts
- ComputerManager
- .create
- compilerOptions
- compilerOptions
- session-admission-lifecycle.test.ts
- ComputerRegistry
- remote-node-client.ts
- event-log.ts
- node-routes.ts
- KnowledgeStore
- workspace-browser.ts
- NewSessionDialog
- .oxlintrc.json
- BackgroundTaskSnapshot
- session-clear-transcript.test.ts
- .claimFailure
- recovery-resend-durability.test.ts
- .publish
- api.test.ts
- capture
- desktop.json
- .replyUserInputInternal
- .syncTranscripts
- settings-local.json
- TranscriptionError
- promotion-monitor.test.ts
- scripts
- file-upload-routes.ts
- session-enqueue-clear.test.ts
- bridge.rs
- package.json
- .drainNextTerminalPrompt
- DeferredSession
- SessionFileUpload
- agent-service-recovery.test.ts
- UserInputFieldControl
- settings.ts
- knowledge-restore.ts
- toolActivityContent
- release-publication.test.ts
- AgentProviderCapability
- composer-layout.test.ts
- session-admissions.ts
- MockMediaRecorder
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
1. `SessionDetail` - 231 edges
2. `AgentService` - 179 edges
3. `App()` - 162 edges
4. `SessionStore` - 121 edges
5. `ClaudeAgentService` - 100 edges
6. `ComputerManager` - 67 edges
7. `RemoteNodeClient` - 55 edges
8. `SessionService` - 54 edges
9. `registerHubRoutes()` - 50 edges
10. `TmuxTerminalSessionController` - 49 edges

## Surprising Connections (you probably didn't know these)
- `navigateMessageHistory()` --indirect_call--> `composer()`  [INFERRED]
  src/App.tsx → server/terminal-send-uncertainty.test.ts
- `AcceptedSdkReply` --references--> `SessionDetail`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `PendingClaudeReply` --references--> `SessionDetail`  [EXTRACTED]
  server/claude-agent-service.ts → shared/contracts.ts
- `RemoteSessionListing` --references--> `ManagedSession`  [EXTRACTED]
  server/computer-manager.ts → shared/contracts.ts
- `RemoteNodeClientEvents` --references--> `ServerEvent`  [EXTRACTED]
  server/remote-node-client.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (120 total, 28 thin omitted)

### Community 0 - "ClaudeAgentService"
Cohesion: 0.06
Nodes (3): ClaudeAgentService, isMissingClaudeSessionError(), RuntimeModelOption

### Community 1 - "App"
Cohesion: 0.05
Nodes (77): clearConversation(), transcribeAudio(), uploadSessionFile(), App(), appendComposerForKey(), appKeyDown(), applyComputerSnapshot(), attachedFiles() (+69 more)

### Community 2 - "App.tsx"
Cohesion: 0.04
Nodes (58): applyAccentIcon(), addComputer(), removeComputer(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation() (+50 more)

### Community 3 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (67): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+59 more)

### Community 4 - "api.ts"
Cohesion: 0.06
Nodes (59): parseSubmissionReceipt(), SubmissionError, submissionReceiptFromError(), cancelBackgroundTask(), cancelSession(), configureRuntime(), deleteKnowledgeRoot(), deletePushSubscription() (+51 more)

### Community 5 - "terminal-session.ts"
Cohesion: 0.10
Nodes (49): composer(), processAdapter, activeBottomFrame(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), COMPOSER_PLACEHOLDERS, composerHoldsOtherText() (+41 more)

### Community 6 - "SessionDetail"
Cohesion: 0.11
Nodes (7): observe(), cloneSession(), SessionStore, ChatMessage, QueuedPrompt, SessionDetail, SessionStatus

### Community 7 - "tmux-errors.integration.test.ts"
Cohesion: 0.09
Nodes (41): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates(), isCopilotProcess() (+33 more)

### Community 8 - "AgentService"
Cohesion: 0.08
Nodes (3): agentMode(), AgentService, RuntimeConfigurationError

### Community 9 - "claude-agent-service.ts"
Cohesion: 0.07
Nodes (23): AgentServiceEvents, CreationRuntime, ActiveClaudeQuery, AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, execFileAsync, isClaudeAuthenticationError() (+15 more)

### Community 10 - "background-task-adapter.ts"
Cohesion: 0.14
Nodes (43): addActivity(), attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), boundedText(), errorValue() (+35 more)

### Community 11 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 12 - "lib.rs"
Cohesion: 0.14
Nodes (35): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+27 more)

### Community 13 - "TmuxTerminalSessionController"
Cohesion: 0.13
Nodes (10): copilotCommand(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand(), safeWindowName(), tmuxTargetForPid(), TmuxTerminalSessionController (+2 more)

### Community 14 - "agent-service.ts"
Cohesion: 0.06
Nodes (38): AcceptedSdkReply, ActivePrompt, activityGroupIdFor(), ActivityToolStart, ansiSequence, commandShortcut(), DeliveryBoundary, ElicitationContext (+30 more)

### Community 15 - "contracts.ts"
Cohesion: 0.06
Nodes (32): ComputerManagerEvents, RemoteResync, RemoteSessionListing, RemoteSessionRead, StoredNodeIdentity, normalizeNodeUrl(), ActivityStatus, AddComputerInput (+24 more)

### Community 16 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 17 - "RemoteNodeClient"
Cohesion: 0.08
Nodes (6): headerSafe(), RemoteNodeClient, NodeInfo, WorkspaceFile, WorkspaceListing, KnowledgeFolderState

### Community 18 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 19 - "WorkspaceDialog"
Cohesion: 0.11
Nodes (34): executeCommand(), listWorkspace(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink(), KnowledgeReader(), markdownComponentsFor() (+26 more)

### Community 20 - "PushNotificationService"
Cohesion: 0.12
Nodes (11): brief(), HubEventSource, PushNotificationService, PushSender, PushState, directories, registerPushRoutes(), sessionMuteSchema (+3 more)

### Community 21 - "pwa.ts"
Cohesion: 0.11
Nodes (33): getPushPublicKey(), savePushSubscription(), sendTestPushNotification(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate(), testNotification() (+25 more)

### Community 24 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 25 - "agentic-remote"
Cohesion: 0.14
Nodes (30): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+22 more)

### Community 28 - "registerHubRoutes"
Cohesion: 0.22
Nodes (4): managedSession(), registerHubRoutes(), ManagedSession, SessionListing

### Community 30 - "dependencies"
Cohesion: 0.06
Nodes (31): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/static, @fastify/websocket (+23 more)

### Community 31 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (28): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+20 more)

### Community 32 - "delegated-transcription-service.ts"
Cohesion: 0.11
Nodes (15): BuildAppOptions, collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation (+7 more)

### Community 33 - "terminal-startup-queue.test.ts"
Cohesion: 0.13
Nodes (23): findActiveCopilotSessions(), directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), directories, exec (+15 more)

### Community 34 - "hub-routes.ts"
Cohesion: 0.08
Nodes (24): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, executeCommandSchema, hostAllowed(), isLoopbackHost() (+16 more)

### Community 35 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 36 - "claude-recovery-admission.test.ts"
Cohesion: 0.11
Nodes (19): connect(), createStore(), deferred(), disk, enqueue(), fixture(), fixtures, holdClaimWrite() (+11 more)

### Community 37 - "directory-browser.ts"
Cohesion: 0.17
Nodes (13): DirectoryScope, displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin() (+5 more)

### Community 38 - "terminal-session.test.ts"
Cohesion: 0.10
Nodes (22): parseTerminalFormActiveField(), parseTerminalUpdateNotice(), submitTerminalForm(), tabNames(), terminalChecklistState(), terminalFormCommitKeys(), terminalFormQuestionEnd(), terminalFormShowsFields() (+14 more)

### Community 39 - "knowledge-tree.ts"
Cohesion: 0.13
Nodes (23): addKnowledgeRoot(), listKnowledgeEntries(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeTreeKeyDown(), loadKnowledgeChain(), loadKnowledgeFolder() (+15 more)

### Community 40 - "session-store-providers.test.ts"
Cohesion: 0.10
Nodes (12): claude(), clearFixture(), copilot(), disk, event(), fixture(), fixtures, holdOtherWrite() (+4 more)

### Community 41 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 42 - ".handleSessionEvent"
Cohesion: 0.20
Nodes (19): activityDuration(), activityKind(), activityResult(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), isBackgroundTaskEvent() (+11 more)

### Community 43 - "transcription-service.ts"
Cohesion: 0.11
Nodes (19): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+11 more)

### Community 44 - "agent-service.test.ts"
Cohesion: 0.11
Nodes (11): CopilotSessionLike, terminalFormSteps(), configurableModel(), directories, FakeCopilotClient, startupFifoFixture(), CopilotTaskInfo, CopilotTaskProgress (+3 more)

### Community 45 - "session-store.ts"
Cohesion: 0.09
Nodes (18): channels, directories, fixture(), activityDuration(), activityResultPreview(), DiscoveredSession, emptyRetirements, isSessionIdList() (+10 more)

### Community 47 - "session-reply-durability.test.ts"
Cohesion: 0.17
Nodes (16): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRequest() (+8 more)

### Community 48 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 49 - "app.ts"
Cohesion: 0.15
Nodes (13): prefixes, session, trusted, untrusted, directories, buildApp(), errorStatusCode(), ServerRole (+5 more)

### Community 50 - "ComputerManager"
Cohesion: 0.26
Nodes (4): ComputerManager, sessionAtLeastAsNew(), RegisteredComputer, ComputerSummary

### Community 52 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 53 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 54 - "session-admission-lifecycle.test.ts"
Cohesion: 0.12
Nodes (12): ClaudeSdk, directories, fixture(), queryHandle(), waitForIdle(), deferred(), disk, enqueue() (+4 more)

### Community 55 - "ComputerRegistry"
Cohesion: 0.17
Nodes (5): ComputerRegistry, directories, remoteSnapshotFixture(), temporaryDirectory(), NodeIdentityStore

### Community 56 - "remote-node-client.ts"
Cohesion: 0.14
Nodes (11): RegistryState, REDIRECT_STATUSES, RemoteNodeClientEvents, RemoteNodeRedirectError, RemoteNodeRequestError, client(), servers, session (+3 more)

### Community 57 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 58 - "node-routes.ts"
Cohesion: 0.11
Nodes (18): MAX_SESSION_FILE_BYTES, AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, executeCommandSchema (+10 more)

### Community 59 - "KnowledgeStore"
Cohesion: 0.17
Nodes (5): KnowledgeState, KnowledgeStore, directories, createHub(), KnowledgeRoot

### Community 60 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 61 - "NewSessionDialog"
Cohesion: 0.16
Nodes (19): activateSession(), createSession(), listDirectories(), listHistory(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), moveSessionToBrowsedFolder() (+11 more)

### Community 62 - ".oxlintrc.json"
Cohesion: 0.12
Nodes (16): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+8 more)

### Community 63 - "BackgroundTaskSnapshot"
Cohesion: 0.20
Nodes (7): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask, BackgroundTaskSnapshot

### Community 64 - "session-clear-transcript.test.ts"
Cohesion: 0.14
Nodes (6): SessionAdmissions, disk, fixtures, gate(), holdTurnWrite(), releases

### Community 66 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 68 - "api.test.ts"
Cohesion: 0.25
Nodes (12): sendMessage(), failWith(), sortSessions(), upsertSessionSnapshot(), currentSessionEventSequence(), nextSessionEventSequence(), projectSessionResponse(), rememberSessionResponse() (+4 more)

### Community 69 - "capture"
Cohesion: 0.20
Nodes (14): releaseRecording(), shortcutKeys(), stopRecording(), binding(), bindingLabel(), capturableCode(), isModifierCode(), keyLabel() (+6 more)

### Community 70 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 72 - ".syncTranscripts"
Cohesion: 0.20
Nodes (4): isForegroundCompletionEvent(), isForegroundLifecycleEvent(), statusFromEvents(), TranscriptObservation

### Community 73 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 74 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 75 - "promotion-monitor.test.ts"
Cohesion: 0.30
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 76 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, check, dev, dev:server, dev:web, lint, start (+3 more)

### Community 77 - "file-upload-routes.ts"
Cohesion: 0.25
Nodes (5): FileUploadError, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile()

### Community 78 - "session-enqueue-clear.test.ts"
Cohesion: 0.29
Nodes (10): disk, EnqueueCase, fixture(), fixtures, gate(), holdEnqueue(), joinedEnqueue(), quiet() (+2 more)

### Community 79 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 80 - "package.json"
Cohesion: 0.22
Nodes (8): name, packageManager, pnpm, onlyBuiltDependencies, private, type, version, ffmpeg-static

### Community 84 - "agent-service-recovery.test.ts"
Cohesion: 0.29
Nodes (5): fixture(), holdProbe(), fixtures, gate(), releases

### Community 85 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 86 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 87 - "knowledge-restore.ts"
Cohesion: 0.43
Nodes (3): KnowledgePosition, KnowledgeRestoreState, base

### Community 88 - "toolActivityContent"
Cohesion: 0.40
Nodes (6): previewText(), readableMcpServerName(), readableToolName(), sameToolLabel(), stripAnsi(), toolActivityContent()

### Community 89 - "release-publication.test.ts"
Cohesion: 0.40
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 93 - "session-admissions.ts"
Cohesion: 0.50
Nodes (3): Admission, ExclusiveAdmission, PendingQueueAdmission

## Knowledge Gaps
- **444 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+439 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 686 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **28 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `TmuxTerminalSessionController` connect `TmuxTerminalSessionController` to `.readAfterWrites`, `terminal-session.ts`, `terminal-session.test.ts`, `tmux-errors.integration.test.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `RemoteNodeClient` connect `RemoteNodeClient` to `directory-browser.ts`, `claude-agent-service.ts`, `contracts.ts`, `SessionFileUpload`, `FakeSessionService`, `BackgroundTaskSnapshot`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _444 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ClaudeAgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.05895061728395062 - nodes in this community are weakly interconnected._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.05284810126582278 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.040993788819875775 - nodes in this community are weakly interconnected._
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
