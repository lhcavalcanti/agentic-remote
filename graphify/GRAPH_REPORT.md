# Agentic Remote - Graphify code map

Snapshot: `fd75c1200a617d8acb7f6537a493ca778b62187720616e367e1d548a6db94f75`

Source checkout: `4110f311cd8abbbae074654578e8574a7f4e13cb`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 727 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 727 files · ~1,270,314 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 10186 nodes · 29191 edges · 281 communities (240 shown, 24 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1372 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- SessionDetail
- AgentService
- AppWorkspace
- api.ts
- workspace-fixtures.ts
- app.ts
- SchedulerStore
- HubEvent
- computer-manager.ts
- ClaudeAgentService
- agent-service.ts
- session-presentation.ts
- App.tsx
- schedules.ts
- claude-agent-service.ts
- ManagedSession
- SessionService
- agent-service.test.ts
- .takeInTranscript
- contracts.ts
- manager-agent.ts
- oracle-voice-child.ts
- ManagerStore
- ManagerAgent
- agentic-remote-promotion-monitor
- OracleVoiceCoordinator
- ManagerMessage
- dreamer-store.ts
- oracle-voice-soak.ts
- background-task-adapter.ts
- VoiceCapture
- node-routes.ts
- transcription-service.ts
- terminal-session.ts
- oracle-voice-routes.test.ts
- oracle-task-store.ts
- FakeVoiceEngine
- schedule-launcher.test.ts
- CopilotClientLike
- hub-routes.ts
- react
- oracle-voice-integration.test.ts
- client.ts
- active-sessions.ts
- RemoteNodeClient
- createManagerTools
- manager-structured-memory-validation.ts
- TmuxTerminalSessionController
- parakeet-worker.ts
- TerminalSessionController
- ComposerActions.tsx
- oracle-voice-worker.ts
- DreamerService
- normalizeKnowledgeRelativePath
- transcript-window.ts
- manager-proactive-coordinator.ts
- remote-voice-client.ts
- session-categories.ts
- feature-flags.ts
- processes.ts
- .sendInternal
- tmux-test-helpers.ts
- AppSettingsDialog.tsx
- RecentlyClosed.tsx
- agentic-remote
- live-dictation-host.test.ts
- parakeet-child.ts
- terminal-session.test.ts
- dreamer-progress.ts
- oracle-voice.ts
- oracle-voice-benchmark.ts
- src/settings-profile.ts
- ManagerAssistant.tsx
- agentic-remote-gate
- live-dictation-session.ts
- oracle-voice-session.ts
- use-live-dictation.ts
- bundle
- oracle-voice-config.ts
- BackgroundTask
- send-matrix.integration.test.ts
- FakeVoiceController
- dictation-routes.test.ts
- controls.tsx
- PushNotificationService
- OracleDreamer.tsx
- SettingsProfileSnapshot
- VoicePlayback
- lib.rs
- live-dictation-benchmark.ts
- client.test.ts
- dependencies
- devDependencies
- oracle-voice-child.test.ts
- shared/settings-profile.ts
- terminal-startup-queue.test.ts
- live-dictation-host.ts
- oracle-voice-routes.ts
- LiveDictationClient
- agentic-remote-promotion-setup
- dreamer-planner.ts
- manager-tools.ts
- manager-proactive-inbox.ts
- config.rs
- oracle-voice-security.test.ts
- dictation-routes.ts
- knowledge-tree.ts
- sections.tsx
- session-prefetch.ts
- manager-context.ts
- BackgroundTasksDialog.tsx
- transcription-benchmark.ts
- markdown-navigation.ts
- manager-structured-memory.ts
- oracle-voice-segments.ts
- SessionOrderStore
- dictation.ts
- ManagerAssistant.test.tsx
- sampler.ts
- session-patch-browser.ts
- VoiceCapabilities
- capture-workspace.ts
- .replyUserInputInternal
- ManagerStructuredMemoryStore
- SessionCategoryStore
- server/skill-settings.ts
- dictation/capture.ts
- session-transcript.ts
- pwa-update.pw.ts
- session-directory.ts
- cli-canary.ts
- scripts
- pipeline.ts
- use-markdown-document.ts
- shell.ts
- .toolHost
- manager-tools.test.ts
- manager-structured-memory-search.ts
- ManagerAttachment
- HostSnapshot
- HostMonitorView.test.tsx
- ManagerProactiveInbox
- session-category-routes.ts
- compilerOptions
- real-voice.ts
- parsers.ts
- use-oracle-settings.ts
- oracle-voice-coordinator.test.ts
- session-clear-transcript.test.ts
- VoiceAudioFrame
- vite.config.ts
- recovery-resend-durability.test.ts
- oracle-voice-tickets.ts
- SessionKnowledgeStore
- session-patches.test.ts
- ActivityDetails.tsx
- compilerOptions
- dreamer-service.ts
- full-gate.test.ts
- response-compression.test.ts
- session-knowledge-store.ts
- session-store-providers.test.ts
- host-telemetry.ts
- compilerOptions
- OnlineRecognizer
- workspace-browser.ts
- MessageTime.tsx
- compilerOptions
- compilerOptions
- dreamer-schedule.ts
- HostTelemetrySampler
- .correct
- transcription-service.test.ts
- SessionStatus
- promotion-monitor.test.ts
- PromptCards.tsx
- BoundedQueue
- ReaderWorkspace
- manager-automatic.ts
- session-reorder.pw.ts
- scripts
- session-latency-benchmark.ts
- knowledge-store.ts
- session-knowledge-routes.ts
- closed-sessions.ts
- renderer.test.ts
- use-markdown-document.test.tsx
- terminal-form-deadline.test.ts
- closed-session-sweeper.ts
- KnowledgeStore
- registerSessionKnowledgeRoutes
- package.json
- session-resource-clear.test.ts
- SessionOriginBadge.test.tsx
- use-oracle-attachments.ts
- fake-vad.ts
- desktop.json
- ChatMessage
- LargeSessionService
- ActivityRow.tsx
- theme-contrast.test.ts
- DictationStatus.tsx
- pending-echo.ts
- shell-notifications.ts
- .oxlintrc.json
- settings-local.json
- dreamer-service.test.ts
- isRecord
- SessionLauncher
- session-scope.ts
- Pcm16Resampler
- recently-closed.pw.ts
- ManagerProactiveInboxValidationError
- manager-proactive-inbox.test.ts
- ActivityRow.test.tsx
- html-preview.ts
- sign-in-expired.pw.ts
- command-catalog-cache.test.ts
- WordAgreement
- session-knowledge-store.test.ts
- static-files.ts
- dataset
- generate-pwa-icons.ts
- bridge.rs
- DreamerMorningPlan
- dreamer-routes.ts
- logs-cli.test.ts
- promotion-setup-execution.test.ts
- SkillsSettings.tsx
- sent-message.ts
- doctor-cli.test.ts
- release-publication.test.ts
- shared/skill-settings.ts
- UserInputFieldControl
- session-list-collisions.test.ts
- composer-layout.test.ts
- HostTelemetryClock
- settings.ts
- DocumentViewControls.tsx
- skill-settings-jsonc.ts
- markdownComponentsFor
- use-foreground-handoff.ts
- promotion-setup.test.ts
- appearance.ts
- terminal-send-uncertainty.test.ts
- MockMediaRecorder
- PcmCaptureProcessor
- version-policy.test.ts
- MermaidDiagram.test.tsx
- tsconfig.json
- @fastify/static
- ffprobe-static
- @github/copilot-sdk
- hast-util-to-jsx-runtime
- lucide-react
- mermaid
- pdfjs-dist
- react-dom
- remark-parse
- web-push
- ws
- sw.js
- recovery-question-styles.test.ts
- agentic-remote-shell

## God Nodes (most connected - your core abstractions)
1. `AppWorkspace()` - 397 edges
2. `SessionDetail` - 328 edges
3. `AgentService` - 318 edges
4. `SessionStore` - 218 edges
5. `ManagedSession` - 190 edges
6. `buildApp()` - 158 edges
7. `ClaudeAgentService` - 133 edges
8. `registerHubRoutes()` - 117 edges
9. `ComputerManager` - 110 edges
10. `ManagerAgent` - 102 edges

## Surprising Connections (you probably didn't know these)
- `composerKeyDown()` --indirect_call--> `composer()`  [INFERRED]
  src/App.tsx → server/terminal-send-uncertainty.test.ts
- `handleDragEnd()` --indirect_call--> `computerOrder()`  [INFERRED]
  src/App.tsx → e2e/session-reorder.pw.ts
- `instrument()` --indirect_call--> `document()`  [INFERRED]
  e2e/session-patch-browser.ts → server/skill-settings-jsonc.ts
- `AcceptedSdkReply` --references--> `SessionDetail`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `CreationRuntime` --references--> `RuntimeReasoningEffort`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (281 total, 24 thin omitted)

### Community 0 - "SessionDetail"
Cohesion: 0.02
Nodes (94): complete(), event(), sessionWithLog(), start(), fixture(), restart(), fixture(), createStore() (+86 more)

### Community 1 - "AgentService"
Cohesion: 0.03
Nodes (13): agentMode(), AgentService, isTerminalNotReadyRefusal(), permissionTitle(), RuntimeConfigurationError, sessionInUseConflictMessage(), sessionInUseQueueMessage(), terminalAnswerRefused() (+5 more)

### Community 2 - "AppWorkspace"
Cohesion: 0.03
Nodes (203): terminalSendOptions(), newSessionCategoryId(), sessionCategoryName(), sessionCategoryOf(), sessionFileValidationError(), submissionReceiptFromError(), askSession(), saveSessionOrderLane() (+195 more)

### Community 3 - "api.ts"
Cohesion: 0.02
Nodes (162): SettingsChange, SettingsProfileKey, SettingsUpdateResult, httpDeliveryUncertain(), parseSubmissionReceipt(), TRANSCRIPT_WINDOW, activateSession(), activityArgumentFormats (+154 more)

### Community 4 - "workspace-fixtures.ts"
Cohesion: 0.02
Nodes (116): { values }, frame(), geometry, output, pageFor(), scratch, screenshot(), { values } (+108 more)

### Community 5 - "app.ts"
Cohesion: 0.02
Nodes (95): prefixes, session, trusted, untrusted, buildApp(), BuildAppOptions, errorStatusCode(), ClientPresence (+87 more)

### Community 6 - "SchedulerStore"
Cohesion: 0.05
Nodes (43): LaunchPrimitives, provenance(), ScheduleProvenance, SessionScheduleLauncher, fixture(), ScheduleNotificationService, headers, hub() (+35 more)

### Community 7 - "HubEvent"
Cohesion: 0.03
Nodes (85): WorkspaceFixture, ComputerManagerEvents, center(), directories, directory(), hub(), now, runtimes (+77 more)

### Community 8 - "computer-manager.ts"
Cohesion: 0.03
Nodes (49): WorkspaceFixtureOptions, activityDetailsUnavailable(), activityNotInLog(), refusal(), updateComputerForActivityDetails(), ClaudeAgentServiceEvents, RemoteSessionListing, DirectoryScope (+41 more)

### Community 9 - "ClaudeAgentService"
Cohesion: 0.04
Nodes (30): ClaudeAgentService, isMissingClaudeSessionError(), cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle() (+22 more)

### Community 10 - "agent-service.ts"
Cohesion: 0.03
Nodes (109): AcceptedSdkReply, ActivePrompt, activityDetailArguments(), activityDetailFromEvents(), activityDetailText(), activityDuration(), activityGroupIdFor(), activityKind() (+101 more)

### Community 11 - "session-presentation.ts"
Cohesion: 0.03
Nodes (99): SessionMcpServerSummary, SessionResourceSource, SessionSkillSummary, DEFAULT_SESSION_PROVIDER, NewSessionBackendSetting, createSession(), listHistory(), startSessionCreation() (+91 more)

### Community 12 - "App.tsx"
Cohesion: 0.03
Nodes (103): isManagerEvent(), executeCommand(), listWorkspace(), ActivityRowStates, sidebarResizeMove(), attachmentId(), bindingMatches(), ChangeDirectoryDialog() (+95 more)

### Community 13 - "schedules.ts"
Cohesion: 0.04
Nodes (96): proposalInput, State, stateSchema, timestamp, CronField, cronMatchesDate(), DAY_NAMES, MONTH_NAMES (+88 more)

### Community 14 - "claude-agent-service.ts"
Cohesion: 0.05
Nodes (77): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, ClaudeResources, ClaudeSdk, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput (+69 more)

### Community 15 - "ManagedSession"
Cohesion: 0.07
Nodes (18): ComputerManager, managedSession(), mapWithConcurrency(), sessionAtLeastAsNew(), RegisteredComputer, ManagerEventSource, registerHubRoutes(), SessionMuteCarrier (+10 more)

### Community 16 - "SessionService"
Cohesion: 0.04
Nodes (15): BackgroundTaskUpdate, closeReason(), closeVoiceSocket(), registerNodeRoutes(), tokenMatches(), owns(), ProviderSessionService, runtime() (+7 more)

### Community 17 - "agent-service.test.ts"
Cohesion: 0.03
Nodes (55): CopilotSessionLike, terminalFormSteps(), busyTerminal(), closableService(), configurableModel(), directories, FakeCopilotClient, normalSdkSessionConfiguration (+47 more)

### Community 18 - ".takeInTranscript"
Cohesion: 0.04
Nodes (59): backgroundShellsEvidence(), contextChangedInEvents(), at(), directories, finish(), launch(), projected(), services (+51 more)

### Community 19 - "contracts.ts"
Cohesion: 0.03
Nodes (65): closable(), provider(), requireFolderTrust(), SessionFolderTrustPolicy, SessionLaunch, SessionLauncherHost, SessionLaunchInput, SessionLaunchPreparationError (+57 more)

### Community 20 - "manager-agent.ts"
Cohesion: 0.04
Nodes (52): discover(), ManagerAgentOptions, ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig, messagePriority(), Rung (+44 more)

### Community 21 - "oracle-voice-child.ts"
Cohesion: 0.05
Nodes (44): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, combinedTranscript(), defaultSpawnPiper(), errorMessage() (+36 more)

### Community 22 - "ManagerStore"
Cohesion: 0.06
Nodes (28): applications, directories, fixture(), releases, scheduledFixture(), session(), sockets, openStore() (+20 more)

### Community 23 - "ManagerAgent"
Cohesion: 0.07
Nodes (17): DreamerProgressView, automaticPayload(), checkContent(), delay(), errorMessage(), isNotFound(), isPending(), isQueued() (+9 more)

### Community 24 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (80): agentic-remote-promotion-monitor script, acquire_test_lock(), ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url() (+72 more)

### Community 25 - "OracleVoiceCoordinator"
Cohesion: 0.07
Nodes (19): AudioCompletion, AudioGate, backendDisconnectFromError(), disconnectCause(), errorMessage(), isBackendDisconnect(), OperationTimeoutError, OracleVoiceBackendConnection (+11 more)

### Community 26 - "ManagerMessage"
Cohesion: 0.04
Nodes (28): FakeManager, FakeVoiceState, installFakeBrowserVoice(), ScriptedUtterance, Window, execFileAsync, RealVoiceState, confirmationSchema (+20 more)

### Community 27 - "dreamer-store.ts"
Cohesion: 0.06
Nodes (41): assertInteger(), assertUniqueJsonKeys(), clone(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS, DREAMER_MAX_STATE_BYTES (+33 more)

### Community 28 - "oracle-voice-soak.ts"
Cohesion: 0.05
Nodes (33): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+25 more)

### Community 29 - "background-task-adapter.ts"
Cohesion: 0.07
Nodes (62): DeferredSession, addActivity(), attachmentModeValue(), backgroundHandoff(), booleanValue(), boundedText(), CopilotClientTaskInfo, CopilotClientTaskProgress (+54 more)

### Community 30 - "VoiceCapture"
Cohesion: 0.06
Nodes (24): BufferedFrame, captureFailure(), defaultAudioContext(), permissionError(), positiveLimit(), QueuedAudio, CaptureControl, harness() (+16 more)

### Community 31 - "node-routes.ts"
Cohesion: 0.05
Nodes (50): FileUploadError, registerFileUploadRoutes(), SessionParams, AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, configureRuntimeSchema, createSessionSchema, directoryQuerySchema (+42 more)

### Community 32 - "transcription-service.ts"
Cohesion: 0.06
Nodes (39): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, ParakeetSpeechEngine (+31 more)

### Community 33 - "terminal-session.ts"
Cohesion: 0.05
Nodes (67): boxedComposerFrame(), captureTerminal(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFrameText(), composerHasFocus(), composerHoldsOtherText(), composerRowText() (+59 more)

### Community 34 - "oracle-voice-routes.test.ts"
Cohesion: 0.04
Nodes (25): ObservedProductionVoiceBackend, voiceBackend(), nodeVoiceCapabilities(), EnabledOracleVoiceConfig, FakeVoiceEngineFactory, VoiceEngineFactory, GatedVoiceEngineFactory, ObservedLocalVoiceBackend (+17 more)

### Community 35 - "oracle-task-store.ts"
Cohesion: 0.07
Nodes (47): setup(), DreamerFollowUp, attemptId(), BeginOracleTaskAttemptInput, ConfirmOracleTaskCompletionInput, isId(), isMissing(), isText() (+39 more)

### Community 36 - "FakeVoiceEngine"
Cohesion: 0.05
Nodes (29): apps, directories, FakeVoiceEngine, identityKey(), isCancelled(), sameGeneration(), VoiceSttEngine, VoiceTtsEngine (+21 more)

### Community 37 - "schedule-launcher.test.ts"
Cohesion: 0.04
Nodes (41): ServerRole, connections, fixture(), managers, releases, remote, session(), SessionMetadataLookup (+33 more)

### Community 38 - "CopilotClientLike"
Cohesion: 0.04
Nodes (49): root, script, CopilotClientLike, directories, fakeClient(), ForkRequest, forkSession(), services (+41 more)

### Community 39 - "hub-routes.ts"
Cohesion: 0.04
Nodes (60): toolCallIdSchema, addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema (+52 more)

### Community 40 - "react"
Cohesion: 0.07
Nodes (46): react, NotificationRecord, scheduleProposalSummary(), validateRecurrence(), ScheduleRecurrence, ScheduleTarget, FeatureEvent, listeners (+38 more)

### Community 41 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (31): apps, availableBackend(), BrowserCapture, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions, BrowserSocket (+23 more)

### Community 42 - "client.ts"
Cohesion: 0.09
Nodes (20): captureClientError(), clientError(), closeError(), closeReason(), isCapabilities(), isRecord(), isTicket(), OracleVoiceCapture (+12 more)

### Community 43 - "active-sessions.ts"
Cohesion: 0.06
Nodes (55): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+47 more)

### Community 44 - "RemoteNodeClient"
Cohesion: 0.05
Nodes (14): RemoteResync, RemoteSessionRead, headerSafe(), RemoteNodeClient, requestBytes(), client(), servers, session (+6 more)

### Community 45 - "createManagerTools"
Cohesion: 0.07
Nodes (19): busyReason(), createManagerTools(), categoryTools(), closeCapReached(), define(), proactiveSessionAllowed(), requireComputer(), resolveSession() (+11 more)

### Community 46 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 47 - "TmuxTerminalSessionController"
Cohesion: 0.08
Nodes (18): startAgentAfterClear(), afterExit(), awaitingRelaunch(), copilotCommand(), endProbeSession(), execFileAsync, formReplyExpired(), listTmuxSessions() (+10 more)

### Community 48 - "parakeet-worker.ts"
Cohesion: 0.08
Nodes (24): main(), abortError(), ChildHandle, DecodeRequest, errorMessage(), PARAKEET_MAX_WINDOW_SECONDS, ParakeetChildProcess, ParakeetUnavailableError (+16 more)

### Community 49 - "TerminalSessionController"
Cohesion: 0.04
Nodes (21): holdProbe(), fixtures, gate(), releases, sdkPermissionEvents(), sdkRecoveryEvents(), removeCopilotSessionFiles(), fixtures (+13 more)

### Community 50 - "ComposerActions.tsx"
Cohesion: 0.07
Nodes (27): families, modelFamily, shortModelName(), repositoryModels, AttachmentStrip(), Composer(), composerSteeringUnavailableReason(), ComposerActions() (+19 more)

### Community 51 - "oracle-voice-worker.ts"
Cohesion: 0.09
Nodes (21): benchmarkGroup(), capabilityFromConfig(), ChildVoiceEngine, errorMessage(), exactKeys(), isCancelledEvent(), isEnabledConfig(), isNonEmptyString() (+13 more)

### Community 52 - "DreamerService"
Cohesion: 0.12
Nodes (9): DreamerMemoryMetadata, digest(), DreamerService, DreamerUnavailableError, planWithFingerprints(), uniqueSessionRefs(), DreamerCompletionCandidate, DreamerSnapshot (+1 more)

### Community 53 - "normalizeKnowledgeRelativePath"
Cohesion: 0.07
Nodes (38): knowledgeFileSchema, knowledgeRelativePathSchema, scopedKnowledgePath(), SessionKnowledgeBinding, joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath() (+30 more)

### Community 54 - "transcript-window.ts"
Cohesion: 0.08
Nodes (26): changedInPlace(), diffMessages(), Publication, sameField(), sameMessage(), sameOrder(), sessionKey(), SessionPublications (+18 more)

### Community 55 - "manager-proactive-coordinator.ts"
Cohesion: 0.08
Nodes (17): apps, directories, DreamerServiceOptions, batchMessageId(), ComputerGenerations, isTerminal(), lifecycles(), ManagerProactiveCoordinator (+9 more)

### Community 56 - "remote-voice-client.ts"
Cohesion: 0.09
Nodes (22): VoiceBackendDisconnectCause, NodeDictationSocketOptions, openNodeDictationSocket(), REDIRECT_STATUSES, repairedError(), closers, RemoteNodeRedirectError, RemoteNodeRequestError (+14 more)

### Community 57 - "session-categories.ts"
Cohesion: 0.09
Nodes (43): CategoryState, Fields, isRecord(), parseState(), validName(), applySessionCategoryChange(), clamp(), CollapsedCategoryShows (+35 more)

### Community 58 - "feature-flags.ts"
Cohesion: 0.10
Nodes (31): WorkspaceFixtureState, hub(), AppVersion, defaultHubFeatureFlags, effectivePreviewFeatures(), HubFeatureFlag, HubFeatureFlags, hubFlagCatalogue (+23 more)

### Community 59 - "processes.ts"
Cohesion: 0.08
Nodes (27): createProcessProcReader(), isUnavailableProcess(), parseProcessParameters(), parseProcessStat(), ProcessProcReader, ProcessStat, expectProc(), ProcessFixture (+19 more)

### Community 60 - ".sendInternal"
Cohesion: 0.12
Nodes (42): terminalComposerUnreadable(), activeBottomFrame(), backgroundShellsAllow(), busyRowStatus(), captureForReplacement(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts() (+34 more)

### Community 61 - "tmux-test-helpers.ts"
Cohesion: 0.08
Nodes (39): [root], assertSameIdentity(), createIsolatedTmuxRoot(), execFileAsync, abandoned, abandonFixture(), creatorCommand(), execute (+31 more)

### Community 62 - "AppSettingsDialog.tsx"
Cohesion: 0.08
Nodes (44): parseAppVersion(), getProviderRuntimeOptions(), getPushPublicKey(), savePushSubscription(), sendTestPushNotification(), applyPwaUpdate(), sidebarTouchStart(), currentAppViewportGeometry() (+36 more)

### Community 63 - "RecentlyClosed.tsx"
Cohesion: 0.06
Nodes (36): closedSessionExpiresAt(), changed(), frames, innermostDialogFrame(), listeners, openDialogFrame(), subscribeDialogFrames(), DialogFrame() (+28 more)

### Community 64 - "agentic-remote"
Cohesion: 0.10
Nodes (45): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), diagnostic_node() (+37 more)

### Community 65 - "live-dictation-host.test.ts"
Cohesion: 0.07
Nodes (26): FAKE_CLOCK_SECONDS, FakeDictationEngine, FakeDictationState, registerFakeDictationControls(), FakeEngine, spoken(), LiveDictationEngineState, attach() (+18 more)

### Community 66 - "parakeet-child.ts"
Cohesion: 0.08
Nodes (32): createParakeetChild(), decodeResult(), errorMessage(), finiteNumbers(), hasCreateAsync(), normalizeParakeetSherpaModule(), PARAKEET_MODEL_FILES, ParakeetChild (+24 more)

### Community 67 - "terminal-session.test.ts"
Cohesion: 0.07
Nodes (38): captureBeforeDeadline(), FormReplyDeadlineError, hasClippedTerminalFormTabs(), isTerminalSessionInUsePrompt(), parseTerminalFormActiveField(), parseTerminalUpdateNotice(), submitTerminalForm(), tabNames() (+30 more)

### Community 68 - "dreamer-progress.ts"
Cohesion: 0.08
Nodes (20): DEFAULT_DREAMER_PROGRESS_LIMITS, DreamerProgress, DreamerProgressLimits, DreamerProgressOptions, DreamerProgressRefresh, DreamerProgressReply, DreamerProgressRequest, DreamerProgressSnapshot (+12 more)

### Community 69 - "oracle-voice.ts"
Cohesion: 0.09
Nodes (37): capabilities, closeServers, exactArrayBuffer(), sockets, startFields, VoiceNode, decodeVoiceAudioFrame(), encodeVoiceAudioFrame() (+29 more)

### Community 70 - "oracle-voice-benchmark.ts"
Cohesion: 0.08
Nodes (39): editsFor(), benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond(), CorpusFixture, CorpusManifest (+31 more)

### Community 71 - "src/settings-profile.ts"
Cohesion: 0.10
Nodes (22): NewSessionRuntime, sameSettingValue(), SETTINGS_MAX_COMPUTERS, settingsProfileKeys, SettingsProfileValues, statuslineItems, CachedProfile, defaultRetryDelaysMs (+14 more)

### Community 72 - "ManagerAssistant.tsx"
Cohesion: 0.08
Nodes (40): editQueuedManagerMessage(), removeQueuedManagerMessage(), resetManager(), resolveManagerConfirmation(), phoneEnterCreatesNewline(), ActivityRow, applyEvent(), boundWidth() (+32 more)

### Community 73 - "agentic-remote-gate"
Cohesion: 0.11
Nodes (44): agentic-remote-gate script, assert_tree(), bindable_host_dir(), browser_counts(), BROWSER_LIBS_DIR, BROWSERS_DIR, CLONE_BASE, conclude() (+36 more)

### Community 74 - "live-dictation-session.ts"
Cohesion: 0.09
Nodes (15): DecodedTokens, joinWords(), fixture, TimedWord, wordsFromTokens(), AudioChunk, DEFAULT_LIVE_DICTATION_OPTIONS, DictationLimitError (+7 more)

### Community 75 - "oracle-voice-session.ts"
Cohesion: 0.13
Nodes (13): acquisitionCancelled(), ActiveUtterance, asSessionError(), disconnectCause(), EngineVoiceBackendSession, isAcquisitionCancelled(), QueuedOutput, sameUtterance() (+5 more)

### Community 76 - "use-live-dictation.ts"
Cohesion: 0.09
Nodes (25): DictationCapabilities, beginSpan(), cancelSpan(), changedRange(), clamp(), DictationSpan, insertedText(), paragraphSeparator() (+17 more)

### Community 77 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 78 - "oracle-voice-config.ts"
Cohesion: 0.08
Nodes (31): buildConfig(), engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, boundedInteger() (+23 more)

### Community 79 - "BackgroundTask"
Cohesion: 0.08
Nodes (25): backgroundTaskNotFound(), backgroundTaskSnapshot(), BackgroundTaskTracker, cloneSnapshot(), listedBackgroundTask(), readBackgroundTaskFrom(), taskFingerprint(), apps (+17 more)

### Community 80 - "send-matrix.integration.test.ts"
Cohesion: 0.06
Nodes (37): message(), BUSY, busyWithoutComposer, CLEAR_REFUSED, client(), dialogs, Draft, drained (+29 more)

### Community 81 - "FakeVoiceController"
Cohesion: 0.09
Nodes (6): beginSpeech(), endSpeech(), expectOk(), FakeVoiceBackend, FakeVoiceController, startFixtureServer()

### Community 82 - "dictation-routes.test.ts"
Cohesion: 0.06
Nodes (21): apps, connect(), Inbox, open(), other, pair(), rawText(), requestJson() (+13 more)

### Community 83 - "controls.tsx"
Cohesion: 0.09
Nodes (38): configureRuntime(), validateSessionDirectory(), moveSessionToBrowsedFolder(), shortcutKeys(), readStoredShortcuts(), AppShortcutBinding, binding(), bindingLabel() (+30 more)

### Community 84 - "PushNotificationService"
Cohesion: 0.11
Nodes (9): start(), HubEventSource, PushNotificationService, scoped(), registerPushRoutes(), sessionMuteSchema, subscriptionSchema, testNotificationSchema (+1 more)

### Community 85 - "OracleDreamer.tsx"
Cohesion: 0.10
Nodes (32): completeDreamerTask(), dispatchDreamerTask(), DreamerApiError, DreamerPlanEdit, DreamerSettingsEdit, DreamerTaskCompletion, DreamerTaskDispatch, DreamerTaskDisposition (+24 more)

### Community 86 - "SettingsProfileSnapshot"
Cohesion: 0.09
Nodes (19): profileStore(), SettingsProfileState, SettingsProfileStore, directories, store(), applySettingsChanges(), applySettingsImport(), isSettingsDeviceId() (+11 more)

### Community 87 - "VoicePlayback"
Cohesion: 0.09
Nodes (12): ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS, pcm16ToFloat(), ScheduledSource, SegmentDrain, audio(), FakeSource, harness(), splitAudio() (+4 more)

### Community 88 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 89 - "live-dictation-benchmark.ts"
Cohesion: 0.09
Nodes (26): batchText(), Clip, dictate(), fixtureDirectory, listen(), main(), median(), NoSessions (+18 more)

### Community 90 - "client.test.ts"
Cohesion: 0.07
Nodes (10): OracleVoiceClientDependencies, OracleVoiceSocket, capabilities, FakePlayback, FakeScheduler, FakeSocket, harness(), isBrowserClientCloseCode() (+2 more)

### Community 91 - "dependencies"
Cohesion: 0.05
Nodes (39): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+31 more)

### Community 92 - "devDependencies"
Cohesion: 0.05
Nodes (39): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+31 more)

### Community 93 - "oracle-voice-child.test.ts"
Cohesion: 0.07
Nodes (16): ActiveBackendSession, createVoiceWorker(), childHarness(), config, FakeChildProcess, FakePiperProcess, fakeSherpa(), FakeSherpaStream (+8 more)

### Community 94 - "shared/settings-profile.ts"
Cohesion: 0.09
Nodes (34): execute, resolveHubDisplayName(), deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, AccentSetting (+26 more)

### Community 95 - "terminal-startup-queue.test.ts"
Cohesion: 0.08
Nodes (29): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAppendedEvents() (+21 more)

### Community 96 - "live-dictation-host.ts"
Cohesion: 0.12
Nodes (14): ConnectionContext, DEFAULT_LIMITS, DictationConnection, elapsed(), errorMessage(), exactArrayBuffer(), LiveDictationHost, LiveDictationHostLimits (+6 more)

### Community 97 - "oracle-voice-routes.ts"
Cohesion: 0.10
Nodes (32): ManagerEventSource, sendNodeVoiceOutput(), OracleVoiceManager, limits(), outputBytes(), ActiveConversation, availableCapabilities(), backendOutputBytes() (+24 more)

### Community 98 - "LiveDictationClient"
Cohesion: 0.10
Nodes (10): PcmCapture, cancelled(), DictationSocket, errorMessage(), LiveDictationClient, LiveDictationStartError, FakeCapture, FakeSocket (+2 more)

### Community 99 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 100 - "dreamer-planner.ts"
Cohesion: 0.10
Nodes (34): activeDreamerMemoryIds(), activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem() (+26 more)

### Community 101 - "manager-tools.ts"
Cohesion: 0.07
Nodes (33): bytes(), HOST_STATUS_MAX_COMPUTERS, HOST_STATUS_MAX_LENGTH, number(), oracleHostStatus(), owner(), processes(), summary() (+25 more)

### Community 102 - "manager-proactive-inbox.ts"
Cohesion: 0.08
Nodes (37): assertExactKeys(), canonicalHash(), cloneState(), DISPOSITIONS, eventId(), hasExactKeys(), isDisposition(), isEventKind() (+29 more)

### Community 103 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 104 - "oracle-voice-security.test.ts"
Cohesion: 0.07
Nodes (21): FakeVoiceEngineCall, SocketMessage, apps, config, configFixture(), connect(), createManager(), Inbox (+13 more)

### Community 105 - "dictation-routes.ts"
Cohesion: 0.13
Nodes (16): DictationComputers, DictationRelay, DictationRouteOptions, DictationTarget, outdatedReason(), registerDictationRoutes(), RelayContext, RelayPhase (+8 more)

### Community 106 - "knowledge-tree.ts"
Cohesion: 0.10
Nodes (33): WorkspaceEntry, readKnowledgeFile(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor(), knowledgeTreeKeyDown() (+25 more)

### Community 107 - "sections.tsx"
Cohesion: 0.12
Nodes (21): AppearanceSetting, getHubHealth(), PreviewFeaturesSettings(), CollapsedCategoriesSetting(), SettingScope(), HealthCard(), accentThemes, appearanceOptions (+13 more)

### Community 108 - "session-prefetch.ts"
Cohesion: 0.10
Nodes (24): browserConnection, ConnectionHints, connectionSparesData(), IdleScheduler, PASSIVE_READS_SINCE, PREFETCH_PASS_BYTES, PREFETCH_SIDEBAR_ROWS, prefetchCandidates() (+16 more)

### Community 109 - "manager-context.ts"
Cohesion: 0.12
Nodes (28): DreamerProgressEntry, ago(), attentionRank(), buildTurnContext(), cachedReply(), changeLines(), clock(), closedLine() (+20 more)

### Community 110 - "BackgroundTasksDialog.tsx"
Cohesion: 0.11
Nodes (28): BackgroundTaskProgressLine, BackgroundTaskDetails(), BackgroundTaskList(), BackgroundTaskRow(), BackgroundTasksDialog(), elapsedPrefix(), messageDateTimeFormatter, messageTimeFormatter (+20 more)

### Community 111 - "transcription-benchmark.ts"
Cohesion: 0.09
Nodes (29): ClipResult, Engine, firstSeconds(), Fixture, fixtureDirectory, report(), repository, residentKiB() (+21 more)

### Community 112 - "markdown-navigation.ts"
Cohesion: 0.12
Nodes (30): followMarkdownLink(), KnowledgeReader(), MarkdownImage(), missingDocumentFragment(), WorkspaceDialog(), moveHere(), navigateDocument(), BreadcrumbSegment (+22 more)

### Community 113 - "manager-structured-memory.ts"
Cohesion: 0.08
Nodes (28): isMissing(), ManagerStructuredMemoryStoreOptions, openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS, MANAGER_STRUCTURED_MEMORY_MAX_KEY_CHARS (+20 more)

### Community 114 - "oracle-voice-segments.ts"
Cohesion: 0.11
Nodes (24): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+16 more)

### Community 115 - "SessionOrderStore"
Cohesion: 0.15
Nodes (13): stores(), orderStore(), carried(), laneFrom(), retire(), sameLane(), sessionOrderKey(), SessionOrderState (+5 more)

### Community 116 - "dictation.ts"
Cohesion: 0.11
Nodes (23): boundedText(), DICTATION_AUDIO_GENERATION, DICTATION_CLIENT_FINAL_TIMEOUT_MS, DICTATION_CLIENT_READY_TIMEOUT_MS, DICTATION_MAX_CLIENT_MESSAGE_BYTES, DICTATION_MAX_TEXT_BYTES, DICTATION_PROTOCOL, DictationClientMessage (+15 more)

### Community 117 - "ManagerAssistant.test.tsx"
Cohesion: 0.07
Nodes (18): cancelManager(), retryManagerMessage(), sendManagerMessage(), sessionLinkTarget(), OracleButton(), OracleControl, OracleIndicator, conversationCapability (+10 more)

### Community 118 - "sampler.ts"
Cohesion: 0.11
Nodes (24): detectWsl(), parseDataMount(), createLinuxHostTelemetryReader(), errorCode(), HostTelemetryProcFile, hostTelemetryProcFiles, HostTelemetryReader, HostTelemetryReaderOptions (+16 more)

### Community 119 - "session-patch-browser.ts"
Cohesion: 0.13
Nodes (27): advance(), Connection, connections, content(), FrameMeasurement, instrument(), lastHeading(), message() (+19 more)

### Community 120 - "VoiceCapabilities"
Cohesion: 0.12
Nodes (14): VoiceCapabilities, getOracleVoiceCapabilities(), OracleVoiceClientOptions, OracleVoiceTranscriptEvent, OracleVoiceUiState, OracleConversation, OracleConversationState, availableCapability (+6 more)

### Community 121 - "capture-workspace.ts"
Cohesion: 0.14
Nodes (23): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+15 more)

### Community 122 - ".replyUserInputInternal"
Cohesion: 0.15
Nodes (6): isUncertainDelivery(), persistedFormAnswer(), TerminalFormContinuation, validateUserInputForm(), TerminalFormReplyError, deliveryUncertaintyFromError()

### Community 123 - "ManagerStructuredMemoryStore"
Cohesion: 0.13
Nodes (10): benchmarkState(), now(), openFixture(), searchSamples(), ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryRecoveryError, ManagerStructuredMemoryStore, open() (+2 more)

### Community 124 - "SessionCategoryStore"
Cohesion: 0.18
Nodes (10): categories(), members(), key(), refused(), remember(), SessionCategoryStore, directories, folder() (+2 more)

### Community 125 - "server/skill-settings.ts"
Cohesion: 0.15
Nodes (17): builtinSkillDirectories(), newestStableFirst(), frontmatterFields(), frontmatterReason(), readBounded(), revision(), applications, directories (+9 more)

### Community 126 - "dictation/capture.ts"
Cohesion: 0.09
Nodes (14): DICTATION_LIMITS, CaptureDeps, createPcmCapture(), defaultDeps(), DICTATION_FRAME_SAMPLES, PageVisibility, PCM_CAPTURE_PROCESSOR, PcmCaptureError (+6 more)

### Community 127 - "session-transcript.ts"
Cohesion: 0.13
Nodes (22): TRANSCRIPT_CARRIED_LIMIT, sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), currentSessionEventSequence(), nextSessionEventSequence(), projectSessionResponse(), rememberSessionResponse() (+14 more)

### Community 128 - "pwa-update.pw.ts"
Cohesion: 0.09
Nodes (12): captureOutputDirectory(), fixtureFrontendBuildCommand, fixtureFrontendDist, installFakeDictationCapture(), BrowserTestSessionService, desktop, open(), phone (+4 more)

### Community 129 - "session-directory.ts"
Cohesion: 0.18
Nodes (20): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), assertOpenedDirectory(), assertOpenedDirectoryPath(), assertSafeResolvedKnowledgePath() (+12 more)

### Community 130 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 131 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 132 - "pipeline.ts"
Cohesion: 0.13
Nodes (23): partlyHeldRenderer(), documentOpening(), documentParts(), documentRenderEvents(), documentUrlTransform(), drawSteps(), growable, htmlBlocks (+15 more)

### Community 133 - "use-markdown-document.ts"
Cohesion: 0.15
Nodes (20): documentJsx(), build(), childrenOf(), DocumentDrawing, drawStep(), elementsFor(), emptyDrawing, finishDrawing() (+12 more)

### Community 134 - "shell.ts"
Cohesion: 0.15
Nodes (24): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), onShellDeepLink(), onShellNotificationReply(), openShellSettings() (+16 more)

### Community 135 - ".toolHost"
Cohesion: 0.12
Nodes (4): ManagerHub, hasExplicitStructuredMemoryIntent(), memoryObject, StructuredMemoryMutationOperation

### Community 136 - "manager-tools.test.ts"
Cohesion: 0.13
Nodes (10): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits, claudeModels, computers, copilotModels (+2 more)

### Community 137 - "manager-structured-memory-search.ts"
Cohesion: 0.14
Nodes (22): authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord(), ManagerStructuredMemoryFormattedContext (+14 more)

### Community 138 - "ManagerAttachment"
Cohesion: 0.16
Nodes (14): failure(), ManagerUploads, referenceId, storedFile, safeUploadName(), writePrivateUpload(), codeExtensions, fileTypes (+6 more)

### Community 139 - "HostSnapshot"
Cohesion: 0.11
Nodes (14): HOST_TELEMETRY_REMOTE_TIMEOUT_MS, HOST_TELEMETRY_STALE_STREAM_MS, subscribeRemoteHost(), connect(), empty, servers, subscriptions, HOST_TELEMETRY_MAX_QUEUE_BYTES (+6 more)

### Community 140 - "HostMonitorView.test.tsx"
Cohesion: 0.14
Nodes (21): MinuteAccumulator, HostMetric, hostMetricNames, HostComputerView(), HostMonitorView(), Sparkline(), computer, metrics (+13 more)

### Community 141 - "ManagerProactiveInbox"
Cohesion: 0.18
Nodes (7): ManagerProactiveInbox, ManagerProactiveInboxCapacityError, ManagerProactiveInboxPersistenceError, nowIso(), publicEvent(), openInbox(), validateLimit()

### Community 142 - "session-category-routes.ts"
Cohesion: 0.10
Nodes (17): createSchema, deleteSchema, keys(), listedInSessionOrder(), moveSchema, name, paramsSchema, parse() (+9 more)

### Community 143 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 144 - "real-voice.ts"
Cohesion: 0.15
Nodes (11): clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics, registerControlRoutes() (+3 more)

### Community 145 - "parsers.ts"
Cohesion: 0.18
Nodes (20): counter(), counterDelta(), CpuCounters, cpuUtilization(), DeviceByteCounters, DeviceCounters, deviceRates(), isWholeDisk() (+12 more)

### Community 146 - "use-oracle-settings.ts"
Cohesion: 0.14
Nodes (17): TurnContextInput, ManagerSessionBackend, ManagerSessionClosePolicy, OracleResponseStyle, getManager(), updateManagerSettings(), setup(), effortFrom() (+9 more)

### Community 147 - "oracle-voice-coordinator.test.ts"
Cohesion: 0.12
Nodes (11): OracleVoiceBackendConnector, OracleVoiceBackendDisconnect, OracleVoiceBackendOutput, capabilities, confirm(), control(), defaults, FakeBackend (+3 more)

### Community 148 - "session-clear-transcript.test.ts"
Cohesion: 0.11
Nodes (9): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions, disk, fixtures, gate(), holdTurnWrite() (+1 more)

### Community 149 - "VoiceAudioFrame"
Cohesion: 0.09
Nodes (9): QueuedAudio, BrowserCaptureOptions, AudioReservation, VoiceFinalTranscript, VoiceFrameAcceptance, VoiceTurnPhase, VoiceTurnStateOptions, VoiceAudioFrame (+1 more)

### Community 150 - "vite.config.ts"
Cohesion: 0.12
Nodes (12): brotliAsync, compress(), gzipAsync, precompressDirectory(), PrecompressedFile, directories, canaryTests, oracleVoiceAssetNames (+4 more)

### Community 151 - "recovery-resend-durability.test.ts"
Cohesion: 0.11
Nodes (16): syncSessionTranscript(), terminalService(), directories, disk, fixture(), gate(), gates, httpBoundary() (+8 more)

### Community 152 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 153 - "SessionKnowledgeStore"
Cohesion: 0.20
Nodes (3): bindingKey(), SessionKnowledgeStore, stateWithPaths()

### Community 154 - "session-patches.test.ts"
Cohesion: 0.17
Nodes (9): Client, Browser, seedOffset, HubResyncRequest, HubTasksResyncRequest, HubWireEvent, applyTaskPatch(), SessionPatchReceiver (+1 more)

### Community 155 - "ActivityDetails.tsx"
Cohesion: 0.18
Nodes (18): ACTIVITY_DETAIL_TEXT_LIMIT_BYTES, TOOL_CALL_ID_PATTERN, activityDetailFailure, detailKey(), formatBytes(), keep(), kept, keptActivityDetail() (+10 more)

### Community 156 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM.Iterable, e2e, playwright.config.ts, compilerOptions, lib, module, moduleResolution, noEmit (+12 more)

### Community 157 - "dreamer-service.ts"
Cohesion: 0.15
Nodes (19): DreamerPlanDraft, DreamerPlannerInput, boundedText(), DreamerPlannerExecutionInput, safeRunError(), unavailableSnapshot(), DreamerCoverageIncrement, DreamerPlanWithFingerprints (+11 more)

### Community 158 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 159 - "response-compression.test.ts"
Cohesion: 0.14
Nodes (18): acceptsGzip(), eligible(), fastify, FastifyContextConfig, gzipAsync, header(), registerResponseCompression(), apps (+10 more)

### Community 160 - "session-knowledge-store.ts"
Cohesion: 0.10
Nodes (19): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+11 more)

### Community 161 - "session-store-providers.test.ts"
Cohesion: 0.11
Nodes (10): claude(), clearFixture(), copilot(), disk, event(), fixtures, holdOtherWrite(), releases (+2 more)

### Community 162 - "host-telemetry.ts"
Cohesion: 0.11
Nodes (18): aggregate, DiskSpaceSchema, HOST_TELEMETRY_CAPABILITY_VERSION, HOST_TELEMETRY_MAX_MINUTES, HostInfoSchema, HostMetricAggregate, HostMetricAggregateSchema, HostMetrics (+10 more)

### Community 163 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 164 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 165 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (16): assertOpenedFilePath(), fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath() (+8 more)

### Community 166 - "MessageTime.tsx"
Cohesion: 0.17
Nodes (17): calendarDay(), calendarKey(), dayFields, dayTime, full, messageTimeParts(), time, yearFields (+9 more)

### Community 167 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 168 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 169 - "dreamer-schedule.ts"
Cohesion: 0.23
Nodes (17): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+9 more)

### Community 170 - "HostTelemetrySampler"
Cohesion: 0.17
Nodes (3): HostTelemetrySampler, HostMinuteAggregate, HostSample

### Community 171 - ".correct"
Cohesion: 0.26
Nodes (7): digest(), ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryCorrectInput, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryRememberInput, ManagerStructuredMemoryState

### Community 172 - "transcription-service.test.ts"
Cohesion: 0.13
Nodes (10): ParakeetDecoder, TRANSCRIPTION_TIMEOUT_MS, CommandRunner, LONGEST_TRANSCRIPTION_MS, MAX_AUDIO_DURATION_SECONDS, convertedWave(), directories, fixture() (+2 more)

### Community 173 - "SessionStatus"
Cohesion: 0.15
Nodes (13): Seen, ManagerProactiveInboxObservation, PersistedCursor, NotificationCursor, Row, SdkRestartRecovery, FinishedSession, SessionUnreadTracker (+5 more)

### Community 174 - "promotion-monitor.test.ts"
Cohesion: 0.24
Nodes (15): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+7 more)

### Community 175 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (13): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+5 more)

### Community 176 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 177 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 178 - "manager-automatic.ts"
Cohesion: 0.19
Nodes (13): automaticTurns(), event(), formatProactivePrompt(), MANAGER_PROACTIVE_EVENT_KINDS, ManagerProactiveEventKind, ProactivePromptEvent, proactivePromptEvents(), failed (+5 more)

### Community 179 - "session-reorder.pw.ts"
Cohesion: 0.13
Nodes (9): center(), computerOrder(), desktop, dropOnto(), longListState(), open(), phone, Point (+1 more)

### Community 180 - "scripts"
Cohesion: 0.12
Nodes (17): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+9 more)

### Community 181 - "session-latency-benchmark.ts"
Cohesion: 0.24
Nodes (16): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+8 more)

### Community 182 - "knowledge-store.ts"
Cohesion: 0.14
Nodes (11): committedRevision(), KnowledgeConfinementClaim, KnowledgeRootReference, KnowledgeRootReservation, KnowledgeRootReservationOptions, KnowledgeState, parseMetadata(), PersistedKnowledgeState (+3 more)

### Community 183 - "session-knowledge-routes.ts"
Cohesion: 0.12
Nodes (11): KnowledgeRootConfinementConflictError, errorStatusCode(), knowledgeBaseName(), Lineage, pathUpdateSchema, RegistrationGeneration, ReplacementEvidence, rootUpdateSchema (+3 more)

### Community 184 - "closed-sessions.ts"
Cohesion: 0.18
Nodes (14): blockParents, CLOSED_SESSION_RETENTION_DAYS, closedCapitals(), closedSessionContext(), excerpt(), head(), htmlElements, htmlText() (+6 more)

### Community 185 - "renderer.test.ts"
Cohesion: 0.16
Nodes (8): render, scope, createWorkerRenderer(), RendererWorker, FakeWorker, startWorkers(), handleRenderRequest(), RenderRequest

### Community 186 - "use-markdown-document.test.tsx"
Cohesion: 0.16
Nodes (8): DocumentRenderEvent, RenderedDocumentTree, DocumentRenderer, DocumentRendererContext, synchronousRenderer, components, Reader(), show()

### Community 187 - "terminal-form-deadline.test.ts"
Cohesion: 0.15
Nodes (12): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+4 more)

### Community 188 - "closed-session-sweeper.ts"
Cohesion: 0.17
Nodes (5): CLOSED_SESSION_SWEEP_INTERVAL_MS, ClosedSessionOwner, ClosedSessionSweeper, now, CLOSED_SESSION_RETENTION_MS

### Community 190 - "registerSessionKnowledgeRoutes"
Cohesion: 0.26
Nodes (12): registerSessionKnowledgeRoutes(), finalizeLifecycleBinding(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession() (+4 more)

### Community 191 - "package.json"
Cohesion: 0.13
Nodes (13): directory, { values }, workflows, engines, node, name, packageManager, pnpm (+5 more)

### Community 192 - "session-resource-clear.test.ts"
Cohesion: 0.17
Nodes (13): apps, directories, directory(), obstructUploads(), pairedFixture(), providerFixture(), providers, seed() (+5 more)

### Community 193 - "SessionOriginBadge.test.tsx"
Cohesion: 0.27
Nodes (9): SessionProvenance, readScheduleLink(), ScheduleLink, scheduleNotificationLabel(), sessionOriginDescription(), icons, labels, SessionOriginBadge() (+1 more)

### Community 194 - "use-oracle-attachments.ts"
Cohesion: 0.26
Nodes (13): uploadManagerFile(), attachmentSize(), OracleAttachmentChips(), OracleMessageAttachments(), DraftAttachment, hasBlockingAttachments(), uploadedReferences(), useOracleAttachments() (+5 more)

### Community 195 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 196 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 197 - "ChatMessage"
Cohesion: 0.18
Nodes (10): TranscriptBuilder, BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, StoredSession, ChatMessage, TranscriptWindow (+2 more)

### Community 199 - "ActivityRow.tsx"
Cohesion: 0.33
Nodes (11): toolCallIdFromActivityId(), activityKindFromMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph(), activityStatusLabel(), compactActivityText(), formatActivityDuration() (+3 more)

### Community 200 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 201 - "DictationStatus.tsx"
Cohesion: 0.20
Nodes (7): ActiveDictationStatus, DictationStatus(), dictationStatusLabel(), LiveDictationStatus, recordingDuration(), FakeRecorder, useVoiceRecorder()

### Community 202 - "pending-echo.ts"
Cohesion: 0.26
Nodes (10): createPendingEcho(), nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, prunePendingEchoMap(), retainPendingEchoes() (+2 more)

### Community 203 - "shell-notifications.ts"
Cohesion: 0.26
Nodes (10): key(), label(), NotifiableSession, notificationState(), requestId(), SessionNotificationState, ShellNotificationContext, shellNotifications() (+2 more)

### Community 204 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 205 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 206 - "dreamer-service.test.ts"
Cohesion: 0.15
Nodes (3): DreamerMemoryMetadataRecord, directories, enabledSettings()

### Community 207 - "isRecord"
Cohesion: 0.24
Nodes (4): isAlreadyExists(), isMissing(), isRecord(), ManagerProactiveInboxRecoveryError

### Community 208 - "SessionLauncher"
Cohesion: 0.19
Nodes (4): delay(), sameFolder(), SessionLauncher, trustedFolderOf()

### Community 209 - "session-scope.ts"
Cohesion: 0.19
Nodes (9): execFileAsync, isSessionScopeLauncher(), ProbeRun, SESSION_SCOPE, sessionLaunchCommand(), sessionScopeAvailable, sessionScopeProbe(), adapter (+1 more)

### Community 210 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 211 - "recently-closed.pw.ts"
Cohesion: 0.23
Nodes (9): bounds(), closedEarlier, closeFromRow(), devices, drawer(), expectUsable(), open(), row() (+1 more)

### Community 212 - "ManagerProactiveInboxValidationError"
Cohesion: 0.20
Nodes (7): emptyState(), ManagerProactiveInboxError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError, ManagerProactiveInboxValidationError, requireId(), validateOptions()

### Community 213 - "manager-proactive-inbox.test.ts"
Cohesion: 0.20
Nodes (7): ManagerProactiveInboxOptions, fsHooks, ReadGate, readState(), statePath(), TestState, writeState()

### Community 214 - "ActivityRow.test.tsx"
Cohesion: 0.20
Nodes (7): ActivityStatus, ActivityRow, bashDetail(), output, raw, runningDetail(), text()

### Community 215 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 216 - "sign-in-expired.pw.ts"
Cohesion: 0.18
Nodes (4): desktop, Layout, layouts, phone

### Community 217 - "command-catalog-cache.test.ts"
Cohesion: 0.25
Nodes (9): at(), Catalog, deferred(), fixture(), fixtures, listed(), releases, runtime() (+1 more)

### Community 219 - "session-knowledge-store.test.ts"
Cohesion: 0.20
Nodes (7): SessionKnowledgeConflictError, SessionKnowledgeRecoveryError, disk, fixture(), fixtures, releases, root()

### Community 220 - "static-files.ts"
Cohesion: 0.27
Nodes (6): RFC-9110, AcceptedEncodings, FILE_HEADERS, isApiPath(), isAppleTouchIconProbe(), registerStaticFiles()

### Community 221 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 222 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 223 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 224 - "DreamerMorningPlan"
Cohesion: 0.38
Nodes (10): DreamerMorningPlan(), confirmCompletion(), confirmTaskCompletion(), dispatchTask(), disposition(), edit(), investigate(), move() (+2 more)

### Community 225 - "dreamer-routes.ts"
Cohesion: 0.25
Nodes (8): dispatchSchema, parse(), planSchema, registerDreamerRoutes(), settingsSchema, taskCompletionSchema, taskDispositionSchema, taskParamsSchema

### Community 226 - "logs-cli.test.ts"
Cohesion: 0.28
Nodes (8): epoch, exec, Explanation, fixture(), journalLine(), journalRecord(), Log, roots

### Community 227 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 228 - "SkillsSettings.tsx"
Cohesion: 0.39
Nodes (7): listComputerSkills(), toggleComputerSkill(), ComputerSkills(), save(), SkillsSettings(), computers, snapshot

### Community 229 - "sent-message.ts"
Cohesion: 0.42
Nodes (5): UserMessage, PauseFollowingContext, sentMessageLength, SentMessageContent(), thirteenLines

### Community 230 - "doctor-cli.test.ts"
Cohesion: 0.32
Nodes (6): Check, checks(), exec, fixture(), fixtures, manifest

### Community 231 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 232 - "shared/skill-settings.ts"
Cohesion: 0.32
Nodes (5): SKILL_SETTINGS_CAPABILITY, skillFrontmatterNameSchema, skillNameSchema, skillSettingsSchema, skillToggleSchema

### Community 233 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 234 - "session-list-collisions.test.ts"
Cohesion: 0.32
Nodes (4): kind(), sessionListCollisions(), Args, layout

### Community 235 - "composer-layout.test.ts"
Cohesion: 0.48
Nodes (4): atRule(), coarsePointerBlock(), composerPointerBlock(), pointerLayout()

### Community 237 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 238 - "DocumentViewControls.tsx"
Cohesion: 0.33
Nodes (3): DocumentViewControls(), actions, outline

### Community 239 - "skill-settings-jsonc.ts"
Cohesion: 0.60
Nodes (4): document(), parseSkillSettings(), replaceDisabledSkills(), Token

### Community 240 - "markdownComponentsFor"
Cohesion: 0.53
Nodes (6): codeFenceProps(), fencedSource(), flatChildren(), markdownComponentsFor(), mermaidFencedSource(), drawnInParts()

### Community 241 - "use-foreground-handoff.ts"
Cohesion: 0.47
Nodes (3): foregroundHandoffTimeoutMs, Handoff, useForegroundHandoff()

### Community 242 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

### Community 243 - "appearance.ts"
Cohesion: 0.50
Nodes (3): Appearance, appearanceFrom(), appearanceStorageKey

## Knowledge Gaps
- **1600 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1595 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 2756 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **24 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `buildApp()` connect `app.ts` to `SessionDetail`, `AgentService`, `cli-canary.ts`, `SchedulerStore`, `HubEvent`, `computer-manager.ts`, `ClaudeAgentService`, `ManagerProactiveInbox`, `session-category-routes.ts`, `ManagedSession`, `SessionService`, `manager-agent.ts`, `ManagerStore`, `ManagerAgent`, `SessionKnowledgeStore`, `ManagerMessage`, `node-routes.ts`, `transcription-service.ts`, `response-compression.test.ts`, `oracle-voice-routes.test.ts`, `oracle-task-store.ts`, `schedule-launcher.test.ts`, `hub-routes.ts`, `HostTelemetrySampler`, `parakeet-worker.ts`, `oracle-voice-worker.ts`, `DreamerService`, `manager-proactive-coordinator.ts`, `KnowledgeStore`, `AppSettingsDialog.tsx`, `oracle-voice-config.ts`, `PushNotificationService`, `SettingsProfileSnapshot`, `static-files.ts`, `live-dictation-host.ts`, `dreamer-routes.ts`, `dictation-routes.ts`, `transcription-benchmark.ts`, `SessionOrderStore`, `.replyUserInputInternal`, `ManagerStructuredMemoryStore`, `SessionCategoryStore`, `server/skill-settings.ts`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **Why does `AgentService` connect `AgentService` to `SessionDetail`, `session-directory.ts`, `computer-manager.ts`, `ClaudeAgentService`, `agent-service.ts`, `claude-agent-service.ts`, `BackgroundTask`, `agent-service.test.ts`, `.takeInTranscript`, `TerminalSessionController`, `contracts.ts`, `transcript-window.ts`, `recovery-resend-durability.test.ts`, `.replyUserInputInternal`, `background-task-adapter.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionDetail` to `AgentService`, `ClaudeAgentService`, `ManagerAttachment`, `agent-service.test.ts`, `.takeInTranscript`, `transcript-window.ts`, `.replyUserInputInternal`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 7 inferred relationships involving `AppWorkspace()` (e.g. with `submitMessage()` and `prefersLightNow()`) actually correct?**
  _`AppWorkspace()` has 7 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1600 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `SessionDetail` be split into smaller, more focused modules?**
  _Cohesion score 0.02418621567557738 - nodes in this community are weakly interconnected._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.03433927200743344 - nodes in this community are weakly interconnected._
## Non-code inventory (not semantically extracted)

- `.github/CODEOWNERS`
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
- `.github/workflows/light-check.yml`
- `.gitignore`
- `.superpowers/sdd/2026-10-16-oracle-conversation-mode/task-10-report.md`
- `.superpowers/sdd/2026-10-16-oracle-conversation-mode/task-11-report.md`
- `.superpowers/sdd/2026-10-16-oracle-conversation-mode/task-12-report.md`
- `.superpowers/sdd/2026-10-16-oracle-conversation-mode/task-9-report.md`
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
- `docs/design/client-features.md`
- `docs/design/composer-input.md`
- `docs/design/host-monitor.md`
- `docs/design/host-telemetry.md`
- `docs/design/launch-identity.md`
- `docs/design/live-dictation.md`
- `docs/design/notification-center.md`
- `docs/design/oracle-conversation-mode.md`
- `docs/design/oracle-dreamer.md`
- `docs/design/oracle-durable-ux.md`
- `docs/design/oracle-proactive-inbox.md`
- `docs/design/scheduler.md`
- `docs/design/session-manager.md`
- `docs/design/session-provenance.md`
- `docs/design/settings-profile.md`
- `docs/licenses/onnxruntime-1.24.2-third-party-notices.txt`
- `docs/licenses/oracle-voice-browser.txt`
- `docs/licenses/oracle-voice.md`
- `docs/mockups/activity-view.html`
- `docs/mockups/brand-logo.html`
- `docs/native-shell.md`
- `docs/oracle-conversation.md`
- `docs/provider-compatibility.md`
- `docs/sdk-architecture-roadmap.md`
- `docs/session-knowledge-api.md`
- `docs/session-retention.md`
- `docs/slash-command-feedback.md`
- `docs/superpowers/plans/2026-10-16-oracle-conversation-mode.md`
- `docs/superpowers/plans/2026-10-16-oracle-structured-memory.md`
- `docs/superpowers/plans/2026-10-20-copilot-sdk-cli-parity.md`
- `docs/superpowers/plans/2026-10-24-copilot-sdk-restart-recovery.md`
- `docs/superpowers/plans/2026-11-04-oracle-periodic-checks.md`
- `docs/superpowers/plans/2026-11-05-session-knowledge-api.md`
- `docs/superpowers/plans/2026-11-06-oracle-actionable-morning-plan.md`
- `docs/superpowers/plans/2026-11-07-dreamer-periodic-refresh.md`
- `docs/superpowers/specs/2026-10-16-oracle-structured-memory-design.md`
- `docs/superpowers/specs/2026-10-17-oracle-proactive-lifecycle-design.md`
- `docs/superpowers/specs/2026-10-20-copilot-sdk-cli-parity-design.md`
- `docs/superpowers/specs/2026-10-24-copilot-sdk-restart-recovery-design.md`
- `docs/superpowers/specs/2026-11-04-oracle-periodic-checks-design.md`
- `docs/superpowers/specs/2026-11-05-session-knowledge-api-design.md`
- `docs/superpowers/specs/2026-11-06-oracle-actionable-morning-plan-design.md`
- `docs/superpowers/specs/2026-11-07-dreamer-periodic-refresh-design.md`
- `e2e/ui-locks.pw.ts-snapshots/desktop-app-settings-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-background-tasks-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-background-tasks-expanded-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-background-tasks-light-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-background-tasks-sheet-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-background-tasks-sheet-light-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-composer-busy-queue-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-composer-busy-queue-light-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-composer-button-row-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-composer-delivery-menu-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-composer-delivery-unavailable-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-composer-family-claude-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-composer-family-openai-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-composer-recording-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-composer-refresh-attachment-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-composer-sent-messages-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-composer-session-panel-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-composer-session-setup-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-composer-status-busy-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-computers-dialog-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-conversation-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-conversation-tool-rows-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-desktop-rail-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-host-monitor-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-host-processes-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-new-session-dialog-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-notification-panel-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-oracle-panel-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-oracle-schedule-approval-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-preview-features-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-recently-closed-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-recently-closed-expanded-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-runtime-dialog-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-scheduler-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-scheduler-form-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-scheduler-name-conflict-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-scheduler-stale-link-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-scheduler-unpaired-target-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-session-actions-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-session-categories-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-session-list-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-session-origin-run-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-session-origin-tasks-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-session-origin-tasks-short-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-session-origins-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-session-subagents-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-settings-health-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-settings-health-search-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-settings-invalid-skill-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-settings-navigation-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-settings-remote-machines-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-settings-search-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-settings-skill-confirmation-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-settings-skills-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-app-settings-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-background-tasks-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-background-tasks-expanded-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-background-tasks-light-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-background-tasks-sheet-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-background-tasks-sheet-light-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-composer-busy-queue-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-composer-busy-queue-light-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-composer-button-row-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-composer-delivery-menu-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-composer-delivery-unavailable-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-composer-family-claude-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-composer-family-openai-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-composer-sent-messages-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-composer-session-panel-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-composer-session-setup-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-composer-status-busy-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-computers-dialog-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-conversation-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-conversation-tool-rows-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-desktop-rail-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-host-monitor-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-host-processes-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-new-session-dialog-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-notification-panel-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-oracle-panel-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-oracle-schedule-approval-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-preview-features-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-recently-closed-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-recently-closed-expanded-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-runtime-dialog-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-scheduler-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-scheduler-form-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-scheduler-name-conflict-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-scheduler-stale-link-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-scheduler-unpaired-target-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-session-actions-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-session-categories-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-session-list-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-session-origin-run-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-session-origin-tasks-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-session-origin-tasks-short-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-session-origins-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-session-subagents-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-settings-health-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-settings-health-search-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-settings-invalid-skill-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-settings-navigation-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-settings-remote-machines-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-settings-search-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-settings-skill-confirmation-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-settings-skills-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-app-settings-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-background-tasks-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-background-tasks-expanded-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-background-tasks-light-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-background-tasks-sheet-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-background-tasks-sheet-light-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-composer-busy-queue-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-composer-busy-queue-light-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-composer-button-row-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-composer-delivery-menu-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-composer-delivery-unavailable-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-composer-family-claude-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-composer-family-openai-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-composer-recording-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-composer-sent-messages-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-composer-session-panel-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-composer-session-setup-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-composer-status-busy-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-computers-dialog-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-conversation-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-conversation-tool-rows-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-desktop-rail-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-host-monitor-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-host-processes-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-new-session-dialog-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-notification-panel-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-oracle-panel-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-oracle-schedule-approval-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-preview-features-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-recently-closed-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-recently-closed-expanded-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-runtime-dialog-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-scheduler-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-scheduler-form-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-scheduler-name-conflict-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-scheduler-stale-link-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-scheduler-unpaired-target-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-session-actions-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-session-categories-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-session-list-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-session-origin-run-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-session-origin-tasks-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-session-origin-tasks-short-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-session-origins-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-session-subagents-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-settings-health-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-settings-health-search-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-settings-invalid-skill-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-settings-navigation-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-settings-remote-machines-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-settings-search-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-settings-skill-confirmation-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-settings-skills-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/scheduler-abandon-desktop-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/scheduler-abandon-phone-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/tool-call-details-desktop-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/tool-call-details-foldable-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/tool-call-details-phone-chromium-linux.png`
- `fixtures/voice/README.md`
- `fixtures/voice/en-false-start.wav`
- `fixtures/voice/en-long-male-clean.wav`
- `fixtures/voice/en-short-background-speech.wav`
- `fixtures/voice/en-short-female-clean.wav`
- `fixtures/voice/en-short-female-noisy.wav`
- `fixtures/voice/pt-BR-long-male-clean.wav`
- `fixtures/voice/pt-BR-short-male-clean.wav`
- `fixtures/voice/pt-BR-short-male-noisy.wav`
- `fixtures/voice/silence-2s.wav`
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
- `src/dreamer.css`
- `src/host-monitor/host-monitor.css`
- `src/index.css`
- `src/notifications/notifications.css`
- `src/rail/rail.css`
- `src/schedule-proposals.css`
- `src/scheduler/scheduler.css`
- `src/settings/README.md`
- `config/oracle-voice-profiles.json`
- `fixtures/voice/parakeet-result-pt-BR-short.json`
