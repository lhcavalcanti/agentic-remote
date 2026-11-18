# Agentic Remote - Graphify code map

Snapshot: `530d49c740c164914d12da5c26725472de6fff03d398b7232879b35fb2ce42b3`

Source checkout: `7dc66f4edd190785780d350d34f1fa8e321f6595`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 628 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 628 files · ~1,115,669 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 8829 nodes · 25519 edges · 261 communities (219 shown, 24 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1291 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- SessionDetail
- AppWorkspace
- workspace-fixtures.ts
- agent-service.ts
- ClaudeAgentService
- App.test.tsx
- App.tsx
- agent-service.test.ts
- client.ts
- session-presentation.ts
- OracleVoiceCoordinator
- ManagerStore
- RemoteNodeClient
- sections.tsx
- computer-manager.ts
- ManagerAgent
- multi-node.test.ts
- claude-agent-service.ts
- terminal-session.test.ts
- agentic-remote-promotion-monitor
- manager-tools.ts
- ComputerManager
- oracle-voice-session.ts
- ManagerMessage
- terminal-session.ts
- contracts.ts
- HostTelemetrySampler
- react
- controls.tsx
- oracle-voice-soak.ts
- app.ts
- tmux-test-helpers.ts
- transcription-service.ts
- oracle-task-store.ts
- SessionService
- queued-dispatch.test.ts
- oracle-voice-integration.test.ts
- hub-routes.ts
- schedules.ts
- TmuxTerminalSessionController
- preview-features.ts
- schedule-launcher.test.ts
- dreamer-service.ts
- DreamerService
- manager-structured-memory-validation.ts
- active-sessions.ts
- oracle-voice-worker.ts
- TerminalSessionController
- host-telemetry.ts
- ProviderSessionService
- sampler.ts
- ScheduleRun
- fake-voice.ts
- session-knowledge-store.ts
- oracle-voice-benchmark.ts
- session-directory.ts
- FakeVoiceEngine
- oracle-voice.ts
- OracleDreamer.tsx
- agentic-remote
- SchedulerStore
- markdown-navigation.ts
- session-knowledge-routes.test.ts
- dreamer-progress.ts
- server/skill-settings.ts
- KnowledgeStore
- agentic-remote-gate
- processes.ts
- bundle
- ResidentVoiceWorker
- VoicePlayback
- DreamerStore
- oracle-voice-child.ts
- shell.ts
- lib.rs
- schedule-recurrence.ts
- ManagerAssistant.tsx
- dependencies
- manager-agent.test.ts
- agentic-remote-promotion-setup
- PushNotificationService
- request
- client.test.ts
- devDependencies
- config.rs
- manager-agent.ts
- terminal-startup-queue.test.ts
- manager-proactive-inbox.ts
- oracle-voice-child.test.ts
- dreamer-planner.ts
- manager-structured-memory.ts
- oracle-voice-security.test.ts
- manager-context.ts
- VoiceClientControl
- ManagedSession
- manager-structured-memory-search.ts
- oracle-voice-routes.test.ts
- send-matrix.integration.test.ts
- session-launcher.ts
- knowledge-tree.ts
- background-task-adapter.ts
- oracle-voice-segments.ts
- SessionOrderStore
- AgentProvider
- ComputerSummary
- registerSessionKnowledgeRoutes
- notification-center-service.ts
- session-patch-browser.ts
- capture-workspace.ts
- real-voice.ts
- session-reply-durability.test.ts
- remote-voice-client.ts
- shared/settings-profile.ts
- ManagerAttachment
- ManagerAssistant.test.tsx
- dreamer-service.test.ts
- ManagerProactiveInbox
- SessionKnowledgeBinding
- cli-canary.ts
- startup-phases.test.ts
- src/settings-profile.ts
- scripts
- notification-classifier.ts
- push-notification-service.ts
- SettingsProfileClient
- VoiceCapture
- session-provenance.test.ts
- DialogFrame.tsx
- use-markdown-document.ts
- compilerOptions
- oracle-voice-config.ts
- manager-tools.test.ts
- ManagerProactiveCoordinator
- oracle-voice-coordinator.test.ts
- renderer.ts
- EnabledOracleVoiceConfig
- session-patches.test.ts
- SessionAdmissions
- ManagerStructuredMemoryStore
- NotificationRecord
- .replyUserInputInternal
- server/side-question.ts
- oracle-voice-tickets.ts
- terminal-form-deadline.test.ts
- compilerOptions
- full-gate.test.ts
- schedule-notification-service.test.ts
- session-store-providers.test.ts
- SettingsProfileSnapshot
- capture.ts
- compilerOptions
- NotificationStore
- OnlineRecognizer
- MessageTime.tsx
- compilerOptions
- compilerOptions
- oracle-status.test.ts
- backgroundTasksFromEvents
- dreamer-schedule.ts
- promotion-monitor.test.ts
- BoundedQueue
- ReaderWorkspace
- manager-automatic.ts
- scripts
- session-latency-benchmark.ts
- ScheduleWorktreeService
- SoakManager
- background-task-stop.test.ts
- closed-session-sweeper.ts
- package.json
- VoiceEngineEvent
- oracle-voice-assets.test.ts
- session-resource-clear.test.ts
- pipeline.ts
- fake-vad.ts
- desktop.json
- DeferredSession
- ManagerStructuredMemoryRuntime
- theme-contrast.test.ts
- pending-echo.ts
- .oxlintrc.json
- settings-local.json
- isRecord
- PromptCards.tsx
- pipeline.test.tsx
- Pcm16Resampler
- background-task-tracker.ts
- manager-proactive-inbox.test.ts
- .initialize
- use-oracle-attachments.ts
- BackgroundTasksDialog.tsx
- html-preview.ts
- use-markdown-document.test.tsx
- sign-in-expired.pw.ts
- HubEvent
- settings-profile-routes.ts
- dataset
- generate-pwa-icons.ts
- ManagerProactiveInboxValidationError
- notification-center.integration.test.ts
- bridge.rs
- transcribeAudio
- VoiceCaptureOptions
- vite.config.ts
- logs-cli.test.ts
- promotion-setup-execution.test.ts
- capture.test.ts
- VoiceVadOptions
- settings-profile.test.ts
- doctor-cli.test.ts
- manager-proactive-coordinator.test.ts
- ChatMessage
- release-publication.test.ts
- UserInputFieldControl
- backgroundHandoff
- HostTelemetryClock
- PreviewFeaturesSettings.test.tsx
- settings.ts
- .transport
- composer-layout.test.ts
- use-foreground-handoff.ts
- usePanelWidth
- promotion-setup.test.ts
- appearance.ts
- storedProvider
- version-policy.test.ts
- MermaidDiagram.test.tsx
- tsconfig.json
- @fastify/static
- ffprobe-static
- hast-util-to-jsx-runtime
- html-url-attributes
- lucide-react
- onnxruntime-web
- mermaid
- react
- remark-gfm
- remark-rehype
- zod
- sw.js
- recovery-question-styles.test.ts
- agentic-remote-shell

## God Nodes (most connected - your core abstractions)
1. `AppWorkspace()` - 344 edges
2. `SessionDetail` - 337 edges
3. `AgentService` - 303 edges
4. `SessionStore` - 207 edges
5. `ManagedSession` - 182 edges
6. `buildApp()` - 138 edges
7. `ClaudeAgentService` - 135 edges
8. `ComputerManager` - 106 edges
9. `registerHubRoutes()` - 104 edges
10. `ManagerAgent` - 101 edges

## Surprising Connections (you probably didn't know these)
- `composerKeyDown()` --indirect_call--> `composer()`  [INFERRED]
  src/App.tsx → server/terminal-send-uncertainty.test.ts
- `FakeVoiceState` --references--> `ManagerMessage`  [EXTRACTED]
  e2e/fixtures/fake-voice.ts → shared/manager.ts
- `instrument()` --indirect_call--> `document()`  [INFERRED]
  e2e/session-patch-browser.ts → server/skill-settings-jsonc.ts
- `AcceptedSdkReply` --references--> `SessionDetail`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `CreationRuntime` --references--> `RuntimeReasoningEffort`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (261 total, 24 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.04
Nodes (13): agentMode(), AgentService, isRuntimeReasoningEffort(), isTerminalNotReadyRefusal(), lifecycleRefusal(), permissionTitle(), RuntimeConfigurationError, sessionInUseConflictMessage() (+5 more)

### Community 1 - "SessionDetail"
Cohesion: 0.03
Nodes (94): fixture(), restart(), connect(), createStore(), deferred(), disk, enqueue(), fixture() (+86 more)

### Community 2 - "AppWorkspace"
Cohesion: 0.03
Nodes (186): askSession(), deleteSession(), readKnowledgeFile(), replyPermission(), saveHiddenSessionVisibility(), saveSessionHidden(), saveSessionVisibility(), setSessionNotificationsMuted() (+178 more)

### Community 3 - "workspace-fixtures.ts"
Cohesion: 0.02
Nodes (89): { values }, frame(), geometry, output, scratch, screenshot(), { values }, accents (+81 more)

### Community 4 - "agent-service.ts"
Cohesion: 0.03
Nodes (92): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, AgentServiceEvents (+84 more)

### Community 5 - "ClaudeAgentService"
Cohesion: 0.04
Nodes (25): ClaudeAgentService, isMissingClaudeSessionError(), cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle() (+17 more)

### Community 6 - "App.test.tsx"
Cohesion: 0.03
Nodes (98): addKnowledgeRoot(), bootstrapSessionOrder(), cancelBackgroundTask(), cancelSession(), checkHubSignIn(), clearConversation(), closeSession(), configureRetention() (+90 more)

### Community 7 - "App.tsx"
Cohesion: 0.03
Nodes (94): ActivityStatus, isManagerEvent(), listClosedSessions(), activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph() (+86 more)

### Community 8 - "agent-service.test.ts"
Cohesion: 0.03
Nodes (68): root, script, CopilotClientLike, CopilotSessionLike, directories, fakeClient(), fixture(), ForkRequest (+60 more)

### Community 9 - "client.ts"
Cohesion: 0.05
Nodes (36): VoiceCapabilities, getOracleVoiceCapabilities(), captureClientError(), clientError(), closeError(), closeReason(), isCapabilities(), isRecord() (+28 more)

### Community 10 - "session-presentation.ts"
Cohesion: 0.04
Nodes (78): hasActiveBackgroundTasks(), hasForegroundTurn(), CLOSED_SESSION_RETENTION_DAYS, closedSessionContext(), closedSessionExpiresAt(), excerpt(), isClosedSessionContext(), said() (+70 more)

### Community 11 - "OracleVoiceCoordinator"
Cohesion: 0.05
Nodes (27): ManagerEventSource, AudioCompletion, AudioGate, backendDisconnectFromError(), disconnectCause(), errorMessage(), isBackendDisconnect(), OperationTimeoutError (+19 more)

### Community 12 - "ManagerStore"
Cohesion: 0.05
Nodes (40): applications, directories, fixture(), releases, scheduledFixture(), session(), sockets, openStore() (+32 more)

### Community 13 - "RemoteNodeClient"
Cohesion: 0.04
Nodes (22): RemoteResync, RemoteSessionRead, headerSafe(), RemoteNodeClient, requestBytes(), RemoteNodeCapabilityError, RemoteNodeRequestError, RemoteNodeTransportError (+14 more)

### Community 14 - "sections.tsx"
Cohesion: 0.04
Nodes (71): RuntimeModelOption, AppearanceSetting, deletePushSubscription(), getManager(), getPushPublicKey(), savePushSubscription(), sendTestPushNotification(), updateManagerSettings() (+63 more)

### Community 15 - "computer-manager.ts"
Cohesion: 0.04
Nodes (71): ClaudeSdk, DurableRegisteredComputer, LegacyRegisteredComputer, LegacyRegistryState, RegisteredComputer, RegistryState, awaitTermination(), LaunchCreations (+63 more)

### Community 16 - "ManagerAgent"
Cohesion: 0.06
Nodes (19): DreamerProgressView, automaticPayload(), checkContent(), delay(), discover(), errorMessage(), isNotFound(), isPending() (+11 more)

### Community 17 - "multi-node.test.ts"
Cohesion: 0.04
Nodes (25): directories, FakeSessionService, openNodeVoiceSocket(), routingFixture(), session(), temporaryDirectory(), voiceControlQueues, voiceControlWaiters (+17 more)

### Community 18 - "claude-agent-service.ts"
Cohesion: 0.07
Nodes (61): AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission (+53 more)

### Community 19 - "terminal-session.test.ts"
Cohesion: 0.06
Nodes (65): activeBottomFrame(), captureBeforeDeadline(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), composerFocusWitnessed(), composerHoldsText(), composerText() (+57 more)

### Community 20 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (80): agentic-remote-promotion-monitor script, acquire_test_lock(), ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url() (+72 more)

### Community 21 - "manager-tools.ts"
Cohesion: 0.05
Nodes (40): APPROVE_WORDS, BUSY_STATUS, busyReason(), computerField, ContextTier, createManagerTools(), changeSuspension(), closeCapReached() (+32 more)

### Community 22 - "ComputerManager"
Cohesion: 0.09
Nodes (9): ComputerManager, managedSession(), mapWithConcurrency(), fixture(), session(), sessionAtLeastAsNew(), registerHubRoutes(), updateComputerForLaunchIdentity() (+1 more)

### Community 23 - "oracle-voice-session.ts"
Cohesion: 0.05
Nodes (60): apps, directories, sendNodeVoiceOutput(), OracleVoiceManager, limits(), outputBytes(), playbackSequence(), ActiveConversation (+52 more)

### Community 24 - "ManagerMessage"
Cohesion: 0.05
Nodes (24): FakeManager, ProactiveManager, FakeAgent, confirmationSchema, defaultsSchema, editSchema, effort, managerInputError() (+16 more)

### Community 25 - "terminal-session.ts"
Cohesion: 0.05
Nodes (66): composer(), processAdapter, boxedComposerFrame(), captureTerminal(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFrameText(), composerHasFocus() (+58 more)

### Community 26 - "contracts.ts"
Cohesion: 0.05
Nodes (59): AddComputerInput, AddKnowledgeRootInput, BackgroundTaskAttachmentMode, BackgroundTaskExecutionMode, DispatchQueuedPromptInput, ManagedQueuedPromptDispatchResult, ManagedRemovedQueuedPrompt, MessageRole (+51 more)

### Community 27 - "HostTelemetrySampler"
Cohesion: 0.06
Nodes (30): prefixes, session, trusted, untrusted, ProcessScanContext, HostRequest, registerHostTelemetryRoutes(), HostTelemetrySampler (+22 more)

### Community 28 - "react"
Cohesion: 0.05
Nodes (37): react, families, modelFamily, repositoryModels, AttachmentStrip(), Composer(), composerSteeringUnavailableReason(), filterSentMessages() (+29 more)

### Community 29 - "controls.tsx"
Cohesion: 0.06
Nodes (60): NewSessionBackendSetting, activateSession(), configureRuntime(), createSession(), getRuntimeOptions(), listDirectories(), listHistory(), validateSessionDirectory() (+52 more)

### Community 30 - "oracle-voice-soak.ts"
Cohesion: 0.06
Nodes (33): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+25 more)

### Community 31 - "app.ts"
Cohesion: 0.05
Nodes (50): buildApp(), BuildAppOptions, errorStatusCode(), isAppleTouchIconProbe(), transcriptionComputerName(), directories, runtimes, trusted (+42 more)

### Community 32 - "tmux-test-helpers.ts"
Cohesion: 0.07
Nodes (53): directories, execFileAsync, processExists(), procStatReads, tmuxSessions, waitForProcessExit(), exec, formFixture() (+45 more)

### Community 33 - "transcription-service.ts"
Cohesion: 0.06
Nodes (35): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, registerTranscriptionRoutes() (+27 more)

### Community 34 - "oracle-task-store.ts"
Cohesion: 0.07
Nodes (45): setup(), DreamerFollowUp, attemptId(), BeginOracleTaskAttemptInput, ConfirmOracleTaskCompletionInput, isId(), isMissing(), isText() (+37 more)

### Community 35 - "SessionService"
Cohesion: 0.06
Nodes (15): ActiveClaudeQuery, closeReason(), closeVoiceSocket(), nodeVoiceCapabilities(), registerNodeRoutes(), releases, session, snapshot (+7 more)

### Community 36 - "queued-dispatch.test.ts"
Cohesion: 0.05
Nodes (29): acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight(), QueuedDelivery, QueuedDispatches (+21 more)

### Community 37 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (31): apps, availableBackend(), BrowserCapture, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions, BrowserSocket (+23 more)

### Community 38 - "hub-routes.ts"
Cohesion: 0.05
Nodes (51): ClientPresence, PRESENCE_TTL_MS, addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema (+43 more)

### Community 39 - "schedules.ts"
Cohesion: 0.06
Nodes (53): action, create, existing, metadata, scheduleProposalSchema, update, CLAUDE_SCHEDULE_UNAVAILABLE_REASON, cronExpression (+45 more)

### Community 40 - "TmuxTerminalSessionController"
Cohesion: 0.08
Nodes (23): startAgentAfterClear(), afterExit(), awaitingRelaunch(), copilotCommand(), endProbeSession(), execFileAsync, parseTerminalUpdateNotice(), processAncestors() (+15 more)

### Community 41 - "preview-features.ts"
Cohesion: 0.09
Nodes (37): hub(), AppVersion, SessionProvenance, defaultHubFeatureFlags, effectivePreviewFeatures(), HubFeatureFlag, HubFeatureFlags, hubFlagCatalogue (+29 more)

### Community 42 - "schedule-launcher.test.ts"
Cohesion: 0.05
Nodes (42): proposalInput, LaunchPrimitives, ScheduleLauncherHost, ScheduleProvenance, scheduleSessionTitle(), directories, dispatchers, folderTrustPermission (+34 more)

### Community 43 - "dreamer-service.ts"
Cohesion: 0.07
Nodes (48): DreamerHistoryEntry, safeRunError(), unavailableSnapshot(), assertInteger(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS (+40 more)

### Community 44 - "DreamerService"
Cohesion: 0.10
Nodes (13): DreamerMemoryMetadata, projectDreamerMemory(), boundedText(), digest(), DreamerService, DreamerUnavailableError, planWithFingerprints(), publicSnapshot() (+5 more)

### Community 45 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (52): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+44 more)

### Community 46 - "active-sessions.ts"
Cohesion: 0.07
Nodes (46): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+38 more)

### Community 47 - "oracle-voice-worker.ts"
Cohesion: 0.09
Nodes (25): benchmarkGroup(), VoiceGenerationIdentity, ActiveSynthesisIdentity, ActiveUtteranceIdentity, capabilityFromConfig(), ChildVoiceEngine, errorMessage(), exactKeys() (+17 more)

### Community 48 - "TerminalSessionController"
Cohesion: 0.04
Nodes (22): holdProbe(), fixtures, gate(), releases, sdkPermissionEvents(), sdkRecoveryEvents(), removeCopilotSessionFiles(), fixtures (+14 more)

### Community 49 - "host-telemetry.ts"
Cohesion: 0.06
Nodes (48): HOST_TELEMETRY_REMOTE_TIMEOUT_MS, HOST_TELEMETRY_STALE_STREAM_MS, subscribeRemoteHost(), connect(), empty, servers, subscriptions, MinuteAccumulator (+40 more)

### Community 51 - "sampler.ts"
Cohesion: 0.08
Nodes (45): counter(), counterDelta(), CpuCounters, cpuUtilization(), detectWsl(), DeviceByteCounters, DeviceCounters, deviceRates() (+37 more)

### Community 52 - "ScheduleRun"
Cohesion: 0.12
Nodes (10): provenance(), recordScheduleProvenance(), SessionScheduleLauncher, ScheduleLauncher, SchedulerDispatcher, ScheduleReconciliation, registerSchedulerRoutes(), holdsSlot() (+2 more)

### Community 53 - "fake-voice.ts"
Cohesion: 0.07
Nodes (13): ActiveBackendSession, beginSpeech(), endSpeech(), expectOk(), FakeVoiceBackend, FakeVoiceController, FakeVoiceState, installFakeBrowserVoice() (+5 more)

### Community 54 - "session-knowledge-store.ts"
Cohesion: 0.07
Nodes (29): bindingKey(), bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor() (+21 more)

### Community 55 - "oracle-voice-benchmark.ts"
Cohesion: 0.07
Nodes (41): execFileAsync, RealVoiceState, benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond(), CorpusFixture (+33 more)

### Community 56 - "session-directory.ts"
Cohesion: 0.09
Nodes (37): DirectoryScope, displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), assertOpenedDirectory(), assertOpenedDirectoryPath() (+29 more)

### Community 57 - "FakeVoiceEngine"
Cohesion: 0.06
Nodes (19): FakeVoiceEngine, FakeVoiceEngineCall, identityKey(), isCancelled(), sameGeneration(), VoiceSttEngine, VoiceTtsEngine, VoiceUtteranceAudioFrame (+11 more)

### Community 58 - "oracle-voice.ts"
Cohesion: 0.08
Nodes (38): config, capabilities, closeServers, exactArrayBuffer(), sockets, startFields, VoiceNode, decodeVoiceAudioFrame() (+30 more)

### Community 59 - "OracleDreamer.tsx"
Cohesion: 0.09
Nodes (41): completeDreamerTask(), dispatchDreamerTask(), DreamerApiError, DreamerPlanEdit, DreamerSettingsEdit, DreamerTaskCompletion, DreamerTaskDispatch, DreamerTaskDisposition (+33 more)

### Community 60 - "agentic-remote"
Cohesion: 0.10
Nodes (45): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), diagnostic_node() (+37 more)

### Community 61 - "SchedulerStore"
Cohesion: 0.12
Nodes (9): enableSchedulerTools(), fixture(), deferUnboundWorktree(), failure(), SchedulerStore, retainedHistory(), ScheduleProposal, Schedule (+1 more)

### Community 62 - "markdown-navigation.ts"
Cohesion: 0.08
Nodes (41): executeCommand(), listWorkspace(), searchWorkspace(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink(), KnowledgeReader() (+33 more)

### Community 63 - "session-knowledge-routes.test.ts"
Cohesion: 0.06
Nodes (24): ServerRole, connections, managers, releases, remote, SessionMetadataLookup, ComputerRegistry, directories (+16 more)

### Community 64 - "dreamer-progress.ts"
Cohesion: 0.08
Nodes (20): DEFAULT_DREAMER_PROGRESS_LIMITS, DreamerProgress, DreamerProgressLimits, DreamerProgressOptions, DreamerProgressRefresh, DreamerProgressReply, DreamerProgressRequest, DreamerProgressSnapshot (+12 more)

### Community 65 - "server/skill-settings.ts"
Cohesion: 0.09
Nodes (28): builtinSkillDirectories(), newestStableFirst(), frontmatterFields(), frontmatterReason(), document(), parseSkillSettings(), replaceDisabledSkills(), Token (+20 more)

### Community 66 - "KnowledgeStore"
Cohesion: 0.08
Nodes (19): SessionMuteCarrier, committedRevision(), KnowledgeConfinementClaim, KnowledgeRootConfinementConflictError, KnowledgeRootReference, KnowledgeRootReservation, KnowledgeRootReservationOptions, KnowledgeState (+11 more)

### Community 67 - "agentic-remote-gate"
Cohesion: 0.11
Nodes (44): agentic-remote-gate script, assert_tree(), bindable_host_dir(), browser_counts(), BROWSER_LIBS_DIR, BROWSERS_DIR, CLONE_BASE, conclude() (+36 more)

### Community 68 - "processes.ts"
Cohesion: 0.09
Nodes (25): createProcessProcReader(), isUnavailableProcess(), parseProcessParameters(), parseProcessStat(), ProcessProcReader, ProcessStat, expectProc(), ProcessFixture (+17 more)

### Community 69 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 70 - "ResidentVoiceWorker"
Cohesion: 0.12
Nodes (8): combinedTranscript(), float32ToPcm16(), matchesCancelled(), readBoundedText(), ResidentVoiceWorker, SherpaRecognizer, SherpaStream, VoiceSynthesisRequest

### Community 71 - "VoicePlayback"
Cohesion: 0.09
Nodes (12): ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS, pcm16ToFloat(), ScheduledSource, SegmentDrain, audio(), FakeSource, harness(), splitAudio() (+4 more)

### Community 72 - "DreamerStore"
Cohesion: 0.12
Nodes (11): assertUniqueJsonKeys(), clone(), DreamerCapacityError, DreamerRecoveryError, DreamerStore, emptyState(), isMissing(), publicPlan() (+3 more)

### Community 73 - "oracle-voice-child.ts"
Cohesion: 0.07
Nodes (33): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, defaultSpawnPiper(), errorMessage(), normalizeSherpaModule() (+25 more)

### Community 74 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 75 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 76 - "schedule-recurrence.ts"
Cohesion: 0.11
Nodes (36): CronField, cronMatchesDate(), DAY_NAMES, MONTH_NAMES, parseCronExpression(), ParsedCronExpression, parseField(), actualSpacingError() (+28 more)

### Community 77 - "ManagerAssistant.tsx"
Cohesion: 0.09
Nodes (34): editQueuedManagerMessage(), resetManager(), resolveManagerConfirmation(), sendManagerMessage(), phoneEnterCreatesNewline(), ActivityRow, applyEvent(), canTakeFocus() (+26 more)

### Community 78 - "dependencies"
Cohesion: 0.05
Nodes (39): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+31 more)

### Community 79 - "manager-agent.test.ts"
Cohesion: 0.08
Nodes (20): ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig, Behavior, capturePrompt(), computers, fail() (+12 more)

### Community 80 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 81 - "PushNotificationService"
Cohesion: 0.13
Nodes (9): start(), PushNotificationService, scoped(), registerPushRoutes(), sessionMuteSchema, subscriptionSchema, testNotificationSchema, unsubscribeSchema (+1 more)

### Community 82 - "request"
Cohesion: 0.13
Nodes (28): scheduleProposalSummary(), ScheduleTarget, getProviderRuntimeOptions(), request(), FolderPicker(), browse(), editableSchedule(), recurrenceSummary() (+20 more)

### Community 83 - "client.test.ts"
Cohesion: 0.07
Nodes (10): HUB_SIGN_IN_EXPIRED_MESSAGE, OracleVoiceClientDependencies, capabilities, FakePlayback, FakeScheduler, FakeSocket, harness(), isBrowserClientCloseCode() (+2 more)

### Community 84 - "devDependencies"
Cohesion: 0.05
Nodes (37): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+29 more)

### Community 85 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 86 - "manager-agent.ts"
Cohesion: 0.10
Nodes (24): ManagerAgentOptions, Rung, TURN_ACTIVITY, TurnContextInput, hasExplicitStructuredMemoryIntent(), memoryObject, StructuredMemoryMutationOperation, AUTONOMOUS_CLOSE_LIMIT (+16 more)

### Community 87 - "terminal-startup-queue.test.ts"
Cohesion: 0.09
Nodes (27): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+19 more)

### Community 88 - "manager-proactive-inbox.ts"
Cohesion: 0.08
Nodes (36): assertExactKeys(), canonicalHash(), cloneState(), DISPOSITIONS, eventId(), hasExactKeys(), isDisposition(), isEventKind() (+28 more)

### Community 89 - "oracle-voice-child.test.ts"
Cohesion: 0.08
Nodes (14): createVoiceWorker(), PiperProcess, childHarness(), config, FakeChildProcess, FakePiperProcess, fakeSherpa(), FakeSherpaStream (+6 more)

### Community 90 - "dreamer-planner.ts"
Cohesion: 0.11
Nodes (33): activeDreamerMemoryIds(), activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem() (+25 more)

### Community 91 - "manager-structured-memory.ts"
Cohesion: 0.07
Nodes (30): ManagerStructuredMemorySearchIndex, ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryStoreOptions, openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS (+22 more)

### Community 92 - "oracle-voice-security.test.ts"
Cohesion: 0.08
Nodes (20): SocketMessage, apps, config, configFixture(), connect(), createManager(), Inbox, issueTicket() (+12 more)

### Community 93 - "manager-context.ts"
Cohesion: 0.13
Nodes (27): DreamerProgressEntry, ago(), attentionRank(), buildTurnContext(), cachedReply(), changeLines(), clock(), closedLine() (+19 more)

### Community 94 - "VoiceClientControl"
Cohesion: 0.19
Nodes (4): asSessionError(), EngineVoiceBackendSession, VoiceSessionError, VoiceClientControl

### Community 95 - "ManagedSession"
Cohesion: 0.12
Nodes (8): RemoteSessionListing, ManagerHub, FakeManager, SessionLaunch, SessionLauncherOptions, SessionPromptTarget, ManagedSession, SessionListing

### Community 96 - "manager-structured-memory-search.ts"
Cohesion: 0.11
Nodes (26): benchmarkState(), now(), openFixture(), searchSamples(), authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson() (+18 more)

### Community 97 - "oracle-voice-routes.test.ts"
Cohesion: 0.08
Nodes (17): exactArrayBuffer(), rawDataBuffer(), rawDataByteLength(), receiveNodeVoiceMessage(), ObservedLocalVoiceBackend, openApps, openSockets, RouteManager (+9 more)

### Community 98 - "send-matrix.integration.test.ts"
Cohesion: 0.07
Nodes (28): message(), BUSY, busyWithoutComposer, CLEAR_REFUSED, client(), dialogs, Draft, drained (+20 more)

### Community 99 - "session-launcher.ts"
Cohesion: 0.09
Nodes (17): delay(), requireFolderTrust(), sameFolder(), SessionFolderTrustPolicy, SessionLauncher, SessionLauncherHost, SessionLaunchInput, SessionLaunchPreparationError (+9 more)

### Community 100 - "knowledge-tree.ts"
Cohesion: 0.10
Nodes (30): WorkspaceEntry, applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeTreeKeyDown(), loadKnowledgeChain(), loadKnowledgeFolder() (+22 more)

### Community 101 - "background-task-adapter.ts"
Cohesion: 0.14
Nodes (30): addActivity(), BackgroundTaskEventOptions, boundedText(), CopilotClientTaskInfo, CopilotClientTaskProgress, errorValue(), MAX_TASK_ACTIVITY_LINES, MAX_TASK_TEXT_LENGTH (+22 more)

### Community 102 - "oracle-voice-segments.ts"
Cohesion: 0.11
Nodes (24): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+16 more)

### Community 103 - "SessionOrderStore"
Cohesion: 0.14
Nodes (13): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+5 more)

### Community 104 - "AgentProvider"
Cohesion: 0.09
Nodes (20): node(), apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService (+12 more)

### Community 105 - "ComputerSummary"
Cohesion: 0.12
Nodes (10): HOST_ALERT_POLL_INTERVAL_MS, HostAlertMonitor, computer, observe(), snapshot(), start, sustained(), NotificationCenterService (+2 more)

### Community 106 - "registerSessionKnowledgeRoutes"
Cohesion: 0.11
Nodes (22): errorStatusCode(), knowledgeBaseName(), Lineage, pathUpdateSchema, registerSessionKnowledgeRoutes(), finalizeLifecycleBinding(), generationFor(), knownPredecessors() (+14 more)

### Community 107 - "notification-center-service.ts"
Cohesion: 0.09
Nodes (25): NotificationCursors, booleanQuery, filters, params, cursorSchema, durableState(), emptyState(), identity (+17 more)

### Community 108 - "session-patch-browser.ts"
Cohesion: 0.12
Nodes (27): pageFor(), advance(), connections, content(), FrameMeasurement, instrument(), lastHeading(), message() (+19 more)

### Community 109 - "capture-workspace.ts"
Cohesion: 0.12
Nodes (25): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+17 more)

### Community 110 - "real-voice.ts"
Cohesion: 0.11
Nodes (12): BrowserTestSessionService, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics (+4 more)

### Community 111 - "session-reply-durability.test.ts"
Cohesion: 0.11
Nodes (19): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRequest() (+11 more)

### Community 112 - "remote-voice-client.ts"
Cohesion: 0.17
Nodes (12): VoiceBackendDisconnectCause, closeReason(), exactArrayBuffer(), rawDataBuffer(), REDIRECT_STATUSES, remoteSocketCloseError(), remoteSocketError(), RemoteVoiceClient (+4 more)

### Community 113 - "shared/settings-profile.ts"
Cohesion: 0.11
Nodes (28): AccentSetting, appearanceSettings, applySettingsImport(), DEFAULT_SESSION_PROVIDER, isRecord(), isSettingsProfileKey(), newSessionBackendSettings, NewSessionFoldersSetting (+20 more)

### Community 114 - "ManagerAttachment"
Cohesion: 0.15
Nodes (17): failure(), ManagerUploads, referenceId, storedFile, safeUploadName(), writePrivateUpload(), codeExtensions, fileTypes (+9 more)

### Community 115 - "ManagerAssistant.test.tsx"
Cohesion: 0.07
Nodes (16): cancelManager(), removeQueuedManagerMessage(), retryManagerMessage(), sessionLinkTarget(), OracleButton(), OracleControl, OracleIndicator, conversationCapability (+8 more)

### Community 116 - "dreamer-service.test.ts"
Cohesion: 0.08
Nodes (16): DreamerMemoryMetadataRecord, dispatchSchema, parse(), planSchema, registerDreamerRoutes(), settingsSchema, taskCompletionSchema, taskDispositionSchema (+8 more)

### Community 117 - "ManagerProactiveInbox"
Cohesion: 0.16
Nodes (8): ManagerProactiveInbox, ManagerProactiveInboxCapacityError, ManagerProactiveInboxError, ManagerProactiveInboxPersistenceError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError, nowIso(), openInbox()

### Community 118 - "SessionKnowledgeBinding"
Cohesion: 0.13
Nodes (17): SessionKnowledgeBinding, getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState (+9 more)

### Community 119 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 120 - "startup-phases.test.ts"
Cohesion: 0.10
Nodes (16): phases, port, app(), directories, headers, launcher, createStartupPhases(), startManagedServer() (+8 more)

### Community 121 - "src/settings-profile.ts"
Cohesion: 0.11
Nodes (21): NewSessionRuntime, SETTINGS_MAX_COMPUTERS, SettingsChange, SettingsProfileKey, settingsProfileKeys, SettingsProfileValues, SettingsUpdateResult, statuslineItems (+13 more)

### Community 122 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 123 - "notification-classifier.ts"
Cohesion: 0.17
Nodes (19): attentionClosed(), attentionSeed(), classifyHostNotification(), classifyHubNotification(), classifyOracleNotification(), HOST_ALERT_MEMORY_DURATION_MS, notificationIdentity(), record() (+11 more)

### Community 124 - "push-notification-service.ts"
Cohesion: 0.12
Nodes (19): brief(), OracleEventSource, PushPolicy, PushSender, PushState, directories, RFC-8030, RFC-8030 (+11 more)

### Community 125 - "SettingsProfileClient"
Cohesion: 0.19
Nodes (5): sameSettingValue(), errorText(), isRefusal(), samePending(), SettingsProfileClient

### Community 126 - "VoiceCapture"
Cohesion: 0.21
Nodes (3): captureFailure(), harness(), VoiceCapture

### Community 127 - "session-provenance.test.ts"
Cohesion: 0.13
Nodes (14): diffMessages(), Publication, sameMessage(), sessionKey(), SessionPublications, SessionUpserted, isSession(), SessionIdentity (+6 more)

### Community 128 - "DialogFrame.tsx"
Cohesion: 0.13
Nodes (19): addComputer(), deleteKnowledgeRoot(), removeComputer(), requestVoid(), removeRoot(), changed(), frames, innermostDialogFrame() (+11 more)

### Community 129 - "use-markdown-document.ts"
Cohesion: 0.15
Nodes (19): build(), childrenOf(), DocumentDrawing, drawStep(), elementsFor(), emptyDrawing, finishDrawing(), Level (+11 more)

### Community 130 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 131 - "oracle-voice-config.ts"
Cohesion: 0.15
Nodes (20): buildConfig(), boundedInteger(), canonicalPath(), espeakDataDirectory(), ExternalPiperVoiceConfig, isInside(), isRecord(), nonNegativeInteger() (+12 more)

### Community 132 - "manager-tools.test.ts"
Cohesion: 0.14
Nodes (8): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits, claudeModels, computers, copilotModels

### Community 133 - "ManagerProactiveCoordinator"
Cohesion: 0.22
Nodes (3): isTerminal(), lifecycles(), ManagerProactiveCoordinator

### Community 134 - "oracle-voice-coordinator.test.ts"
Cohesion: 0.12
Nodes (11): OracleVoiceBackendConnector, OracleVoiceBackendDisconnect, OracleVoiceBackendOutput, capabilities, confirm(), control(), defaults, FakeBackend (+3 more)

### Community 135 - "renderer.ts"
Cohesion: 0.14
Nodes (13): holdingRenderer(), render, scope, DocumentRenderEvent, documentRenderEvents(), createWorkerRenderer(), defaultDocumentRenderer(), RendererWorker (+5 more)

### Community 136 - "EnabledOracleVoiceConfig"
Cohesion: 0.10
Nodes (6): voiceBackend(), EnabledOracleVoiceConfig, FakeVoiceEngineFactory, GatedVoiceEngineFactory, isEnabledConfig(), VoiceBackendCapability

### Community 137 - "session-patches.test.ts"
Cohesion: 0.15
Nodes (11): Connection, nextVoiceControl(), Client, PatchSocket, Browser, seedOffset, session(), HubResyncRequest (+3 more)

### Community 138 - "SessionAdmissions"
Cohesion: 0.11
Nodes (9): eventsFor(), ModelMessage, random(), seedOffset, terminalTypes, Admission, ExclusiveAdmission, PendingQueueAdmission (+1 more)

### Community 139 - "ManagerStructuredMemoryStore"
Cohesion: 0.25
Nodes (7): digest(), ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryStore, ManagerStructuredMemoryCorrectInput, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryRememberInput, ManagerStructuredMemoryState

### Community 140 - "NotificationRecord"
Cohesion: 0.18
Nodes (16): NotificationRecord, FeatureEvent, listeners, publishFeatureEvent(), subscribeFeatureEvents(), NotificationGroup, notificationGroups(), NotificationTab (+8 more)

### Community 141 - ".replyUserInputInternal"
Cohesion: 0.19
Nodes (5): isUncertainDelivery(), persistedFormAnswer(), terminalAnswerRefused(), validateUserInputForm(), deliveryUncertaintyFromError()

### Community 142 - "server/side-question.ts"
Cohesion: 0.16
Nodes (10): SIDE_QUESTION_CLEANUP_MS, SIDE_QUESTION_RUNTIME_IDLE_MS, SIDE_QUESTION_TIMEOUT_MS, sideQuestionBoundary(), SideQuestionError, sideQuestionPrompt(), withSideQuestionTimeout(), SIDE_QUESTION_EARLIER_ANSWER_MAX_LENGTH (+2 more)

### Community 143 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 144 - "terminal-form-deadline.test.ts"
Cohesion: 0.11
Nodes (15): TerminalFormContinuation, question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture() (+7 more)

### Community 145 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM.Iterable, e2e, playwright.config.ts, compilerOptions, lib, module, moduleResolution, noEmit (+12 more)

### Community 146 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 147 - "schedule-notification-service.test.ts"
Cohesion: 0.18
Nodes (7): classifyScheduleNotification(), ScheduleNotificationService, input(), now, run(), ScheduleRunNotification, SchedulerChanged

### Community 148 - "session-store-providers.test.ts"
Cohesion: 0.11
Nodes (10): claude(), clearFixture(), copilot(), disk, event(), fixtures, releases, sdkSession() (+2 more)

### Community 149 - "SettingsProfileSnapshot"
Cohesion: 0.18
Nodes (11): profileStore(), SettingsProfileState, SettingsProfileStore, directories, store(), isSettingsDeviceId(), isSettingsRevision(), SettingsProfileRecord (+3 more)

### Community 150 - "capture.ts"
Cohesion: 0.13
Nodes (15): BufferedFrame, defaultAudioContext(), permissionError(), positiveLimit(), QueuedAudio, validateIdentity(), VoiceCaptureError, VoiceCaptureErrorCode (+7 more)

### Community 151 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 152 - "NotificationStore"
Cohesion: 0.21
Nodes (4): matchesNotification(), NotificationStore, setup(), NotificationFilter

### Community 153 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 154 - "MessageTime.tsx"
Cohesion: 0.17
Nodes (17): calendarDay(), calendarKey(), dayFields, dayTime, full, messageTimeParts(), time, yearFields (+9 more)

### Community 155 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 156 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 157 - "oracle-status.test.ts"
Cohesion: 0.18
Nodes (15): bytes(), HOST_STATUS_MAX_COMPUTERS, HOST_STATUS_MAX_LENGTH, number(), oracleHostStatus(), owner(), processes(), summary() (+7 more)

### Community 158 - "backgroundTasksFromEvents"
Cohesion: 0.18
Nodes (18): backgroundTasksFromEvents(), eventString(), eventTask(), executionModeValue(), isLiveTaskStatus(), isOlderExecution(), isShellObserverTool(), isShellStopTool() (+10 more)

### Community 159 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 160 - "promotion-monitor.test.ts"
Cohesion: 0.24
Nodes (15): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+7 more)

### Community 161 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 162 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 163 - "manager-automatic.ts"
Cohesion: 0.19
Nodes (13): automaticTurns(), event(), formatProactivePrompt(), MANAGER_PROACTIVE_EVENT_KINDS, ManagerProactiveEventKind, ProactivePromptEvent, proactivePromptEvents(), failed (+5 more)

### Community 164 - "scripts"
Cohesion: 0.12
Nodes (17): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+9 more)

### Community 165 - "session-latency-benchmark.ts"
Cohesion: 0.24
Nodes (16): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+8 more)

### Community 166 - "ScheduleWorktreeService"
Cohesion: 0.35
Nodes (5): execute, failure(), missing(), ScheduleWorktreeService, ScheduleWorktreeRecord

### Community 168 - "background-task-stop.test.ts"
Cohesion: 0.21
Nodes (13): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), snapshot() (+5 more)

### Community 169 - "closed-session-sweeper.ts"
Cohesion: 0.17
Nodes (5): CLOSED_SESSION_SWEEP_INTERVAL_MS, ClosedSessionOwner, ClosedSessionSweeper, now, CLOSED_SESSION_RETENTION_MS

### Community 170 - "package.json"
Cohesion: 0.13
Nodes (13): directory, { values }, workflows, engines, node, name, packageManager, pnpm (+5 more)

### Community 171 - "VoiceEngineEvent"
Cohesion: 0.18
Nodes (7): engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, VoiceEngineEvent

### Community 172 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 173 - "session-resource-clear.test.ts"
Cohesion: 0.17
Nodes (12): apps, directories, directory(), pairedFixture(), providerFixture(), providers, seed(), sockets (+4 more)

### Community 174 - "pipeline.ts"
Cohesion: 0.21
Nodes (14): partlyHeldRenderer(), documentParts(), documentUrlTransform(), drawSteps(), growable, htmlBlocks, isDiagram(), processor (+6 more)

### Community 175 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 176 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 177 - "DeferredSession"
Cohesion: 0.16
Nodes (4): DeferredSession, CopilotTaskInfo, CopilotTaskProgress, BackgroundTaskKind

### Community 178 - "ManagerStructuredMemoryRuntime"
Cohesion: 0.20
Nodes (6): efforts, managerRuntimeSettings, initializeManagerStructuredMemory(), ManagerStructuredMemoryRuntime, ManagerStructuredMemoryMode, ManagerStructuredMemoryStatus

### Community 179 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 180 - "pending-echo.ts"
Cohesion: 0.26
Nodes (10): createPendingEcho(), nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, prunePendingEchoMap(), retainPendingEchoes() (+2 more)

### Community 181 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 182 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 183 - "isRecord"
Cohesion: 0.24
Nodes (4): isAlreadyExists(), isMissing(), isRecord(), ManagerProactiveInboxRecoveryError

### Community 184 - "PromptCards.tsx"
Cohesion: 0.21
Nodes (11): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+3 more)

### Community 185 - "pipeline.test.tsx"
Cohesion: 0.21
Nodes (9): documentJsx(), documentOpening(), components, drawn(), drawnPage(), fixtures, html(), today() (+1 more)

### Community 186 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 187 - "background-task-tracker.ts"
Cohesion: 0.30
Nodes (6): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 188 - "manager-proactive-inbox.test.ts"
Cohesion: 0.20
Nodes (7): ManagerProactiveInboxObservation, fsHooks, ReadGate, readState(), statePath(), TestState, writeState()

### Community 189 - ".initialize"
Cohesion: 0.24
Nodes (4): isMissing(), ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryRecoveryError, open()

### Community 190 - "use-oracle-attachments.ts"
Cohesion: 0.35
Nodes (11): removeManagerFile(), uploadManagerFile(), DraftAttachment, hasBlockingAttachments(), uploadedReferences(), useOracleAttachments(), drain(), intake() (+3 more)

### Community 191 - "BackgroundTasksDialog.tsx"
Cohesion: 0.27
Nodes (9): BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive(), taskStatusLabel() (+1 more)

### Community 192 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 193 - "use-markdown-document.test.tsx"
Cohesion: 0.18
Nodes (5): RenderedDocumentTree, DocumentRenderer, DocumentRendererContext, components, show()

### Community 194 - "sign-in-expired.pw.ts"
Cohesion: 0.18
Nodes (4): desktop, Layout, layouts, phone

### Community 195 - "HubEvent"
Cohesion: 0.20
Nodes (4): ComputerManagerEvents, NotificationRecorder, HubEventSource, HubEvent

### Community 196 - "settings-profile-routes.ts"
Cohesion: 0.25
Nodes (8): execute, resolveHubDisplayName(), deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, SETTINGS_DEVICE_ID_MAX_LENGTH

### Community 197 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 198 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 199 - "ManagerProactiveInboxValidationError"
Cohesion: 0.24
Nodes (7): emptyState(), ManagerProactiveInboxValidationError, publicEvent(), requireId(), validateLimit(), validateOptions(), rejectBeforeHello()

### Community 200 - "notification-center.integration.test.ts"
Cohesion: 0.22
Nodes (7): center(), directories, directory(), hub(), now, runtimes, trusted

### Community 201 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 202 - "transcribeAudio"
Cohesion: 0.29
Nodes (4): transcribeAudio(), recordingDuration(), FakeRecorder, useVoiceRecorder()

### Community 204 - "vite.config.ts"
Cohesion: 0.20
Nodes (5): canaryTests, oracleVoiceAssetNames, packageVersion, slowTests, tmuxTests

### Community 205 - "logs-cli.test.ts"
Cohesion: 0.28
Nodes (8): epoch, exec, Explanation, fixture(), journalLine(), journalRecord(), Log, roots

### Community 206 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 207 - "capture.test.ts"
Cohesion: 0.22
Nodes (3): CaptureControl, VoiceCaptureDependencies, VoiceVad

### Community 209 - "settings-profile.test.ts"
Cohesion: 0.25
Nodes (4): resolveAppearance(), settingsProfileCacheKey, cached(), MemoryStorage

### Community 210 - "doctor-cli.test.ts"
Cohesion: 0.32
Nodes (6): Check, checks(), exec, fixture(), fixtures, manifest

### Community 211 - "manager-proactive-coordinator.test.ts"
Cohesion: 0.29
Nodes (4): directories, fixture(), managed(), ManagerProactiveInboxOptions

### Community 212 - "ChatMessage"
Cohesion: 0.36
Nodes (6): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, StoredSession, ChatMessage

### Community 213 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 214 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 215 - "backgroundHandoff"
Cohesion: 0.38
Nodes (7): attachmentModeValue(), backgroundHandoff(), booleanValue(), rawTailText(), shellStopAcknowledged(), shellTaskMode(), toolTelemetryProperties()

### Community 217 - "PreviewFeaturesSettings.test.tsx"
Cohesion: 0.33
Nodes (5): applySettingsChanges(), clients, EffectiveState(), hub(), SchedulerDraft()

### Community 218 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 220 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 221 - "use-foreground-handoff.ts"
Cohesion: 0.47
Nodes (3): foregroundHandoffTimeoutMs, Handoff, useForegroundHandoff()

### Community 222 - "usePanelWidth"
Cohesion: 0.47
Nodes (6): boundWidth(), readWidth(), storeWidth(), usePanelWidth(), commit(), finish()

### Community 223 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

### Community 224 - "appearance.ts"
Cohesion: 0.50
Nodes (3): Appearance, appearanceFrom(), appearanceStorageKey

## Knowledge Gaps
- **1419 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1414 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 2368 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **24 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `SessionDetail`, `storedProvider`, `agent-service.ts`, `queued-dispatch.test.ts`, `agent-service.test.ts`, `.replyUserInputInternal`, `server/side-question.ts`, `TerminalSessionController`, `multi-node.test.ts`, `claude-agent-service.ts`, `session-directory.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `buildApp()` connect `app.ts` to `AgentService`, `SessionDetail`, `oracle-voice-config.ts`, `ClaudeAgentService`, `ManagerProactiveCoordinator`, `ManagerStore`, `.replyUserInputInternal`, `ManagerAgent`, `schedule-notification-service.test.ts`, `SettingsProfileSnapshot`, `ComputerManager`, `oracle-voice-session.ts`, `ManagerMessage`, `NotificationStore`, `HostTelemetrySampler`, `transcription-service.ts`, `oracle-task-store.ts`, `SessionService`, `hub-routes.ts`, `ScheduleWorktreeService`, `preview-features.ts`, `DreamerService`, `oracle-voice-worker.ts`, `ManagerStructuredMemoryRuntime`, `ProviderSessionService`, `ScheduleRun`, `session-knowledge-store.ts`, `SchedulerStore`, `session-knowledge-routes.test.ts`, `server/skill-settings.ts`, `KnowledgeStore`, `PushNotificationService`, `SessionOrderStore`, `ComputerSummary`, `dreamer-service.test.ts`, `ManagerProactiveInbox`, `cli-canary.ts`, `session-provenance.test.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `RemoteNodeClient` connect `RemoteNodeClient` to `server/skill-settings.ts`, `remote-voice-client.ts`, `multi-node.test.ts`, `claude-agent-service.ts`, `session-directory.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `AppWorkspace()` (e.g. with `prefersLightNow()` and `readOraclePlacement()`) actually correct?**
  _`AppWorkspace()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1419 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.03738127267539032 - nodes in this community are weakly interconnected._
- **Should `SessionDetail` be split into smaller, more focused modules?**
  _Cohesion score 0.025799657759641964 - nodes in this community are weakly interconnected._
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
- `e2e/ui-locks.pw.ts-snapshots/desktop-composer-busy-queue-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-composer-button-row-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-composer-delivery-menu-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-composer-delivery-unavailable-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-composer-family-claude-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-composer-family-openai-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-composer-sent-messages-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-composer-session-panel-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-composer-session-setup-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-composer-status-busy-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-computers-dialog-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-conversation-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-desktop-rail-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-host-monitor-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-host-processes-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-new-session-dialog-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-notification-panel-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-oracle-panel-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-oracle-schedule-approval-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-preview-features-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-runtime-dialog-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-scheduler-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-scheduler-form-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-scheduler-name-conflict-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-scheduler-stale-link-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-scheduler-unpaired-target-chromium-linux.png`
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
- `e2e/ui-locks.pw.ts-snapshots/foldable-composer-busy-queue-chromium-linux.png`
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
- `e2e/ui-locks.pw.ts-snapshots/foldable-desktop-rail-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-host-monitor-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-host-processes-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-new-session-dialog-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-notification-panel-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-oracle-panel-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-oracle-schedule-approval-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-preview-features-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-runtime-dialog-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-scheduler-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-scheduler-form-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-scheduler-name-conflict-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-scheduler-stale-link-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-scheduler-unpaired-target-chromium-linux.png`
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
- `e2e/ui-locks.pw.ts-snapshots/phone-composer-busy-queue-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-composer-button-row-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-composer-delivery-menu-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-composer-delivery-unavailable-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-composer-family-claude-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-composer-family-openai-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-composer-sent-messages-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-composer-session-panel-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-composer-session-setup-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-composer-status-busy-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-computers-dialog-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-conversation-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-desktop-rail-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-host-monitor-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-host-processes-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-new-session-dialog-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-notification-panel-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-oracle-panel-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-oracle-schedule-approval-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-preview-features-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-runtime-dialog-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-scheduler-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-scheduler-form-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-scheduler-name-conflict-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-scheduler-stale-link-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-scheduler-unpaired-target-chromium-linux.png`
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
