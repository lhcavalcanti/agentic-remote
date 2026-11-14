# App settings

The category preview preserves the shell's hub-wide Display name field in App and moves existing scheduler permission defaults into a Scheduler category when the scheduler preview is available. The legacy layout keeps its existing placement. Remote machines offers Open Host monitor only when that preview is effective; it closes Settings and opens the existing monitor view.

The default-off `settingsNavigation` preview replaces the jump bar with searchable categories and a content pane. Phones use a category list followed by a page with an All settings button. Category buttons support Up/Down/Home/End; Escape keeps the app's existing topmost-dialog close behavior. Section scope labels distinguish hub-wide settings from this device. Search matches category and field labels and hides nonmatching cards without writing settings.

Remote machines embeds the same pairing/removal body as the legacy Computers dialog, adds the hub's online state, role and reported version, and refreshes connection status without starting processes. Manage computers deep-links here while the preview is enabled. Rename is not exposed because the existing API has no rename operation; a name can be supplied when pairing. Preview off preserves the original dialog and category order.

`AppSettingsDialog` renders the existing single scrolling dialog. `settingsSections` supplies the same Models, Folders, Oracle, Notifications, Interface, and App order to both its jump bar and its content. `scrollSettingsTo` scrolls only that dialog, moves heading focus on navigation, and follows Oracle's initial section while catalogs load until the user takes over scrolling.

Each `SettingsSection` declares `id`, `title`, `icon`, `scope`, and `render(props)`. The scope records the section's primary ownership:

- Models, Folders, Oracle, and Interface: `hub`.
- Notifications (permission and push subscription) and App (connection and updates): `device`.

Interface retains device-local keyboard shortcuts, and App still shows the hub's sync status. Oracle's own model and folders remain in its existing hub-owned manager settings, not the settings profile. Existing per-control scope labels remain unchanged; registry icons and scope metadata are not displayed.

`App` still owns the settings-profile client and passes its current values, state, and callbacks to the dialog. Profile revisions, persistence, offline handling, and conflict resolution are unchanged. The shared status-line controls and runtime defaults are also used by the existing session UI. Runtime presentation helpers and default-runtime types have a single owner in `src/session-setup/`; settings imports those canonical exports.
