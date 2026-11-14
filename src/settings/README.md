# App settings

`AppSettingsDialog` renders the existing single scrolling dialog. `settingsSections` supplies the same Models, Folders, Oracle, Notifications, Interface, and App order to both its jump bar and its content. `scrollSettingsTo` scrolls only that dialog, moves heading focus on navigation, and follows Oracle's initial section while catalogs load until the user takes over scrolling.

Each `SettingsSection` declares `id`, `title`, `icon`, `scope`, and `render(props)`. The scope records the section's primary ownership:

- Models, Folders, Oracle, and Interface: `hub`.
- Notifications (permission and push subscription) and App (connection and updates): `device`.

Interface retains device-local keyboard shortcuts, and App still shows the hub's sync status. Oracle's own model and folders remain in its existing hub-owned manager settings, not the settings profile. Existing per-control scope labels remain unchanged; registry icons and scope metadata are not displayed.

`App` still owns the settings-profile client and passes its current values, state, and callbacks to the dialog. Profile revisions, persistence, offline handling, and conflict resolution are unchanged. The shared status-line controls and runtime defaults are also used by the existing session UI. Runtime presentation helpers and default-runtime types have a single owner in `src/session-setup/`; settings imports those canonical exports.
