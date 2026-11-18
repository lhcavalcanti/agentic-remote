# Client navigation previews

The client feature registry describes a label, lucide icon, optional ordered rail entry and open action. It has no server counterpart: a server plugin registry is unnecessary until a server feature needs one. Existing origin-enforced route registration and service startup remain authoritative.

`desktopRail` is a default-off Interface preview. Above 960 px it adds a compact rail beside the unchanged session navigation; narrower layouts place the same footer entries at the bottom of the drawer. Existing shortcuts and session ownership do not change. The Oracle button opens the existing Oracle panel and appears only while the panel's authoritative availability signal is true; disabling Oracle leaves no dead rail control. Feature entries appear only when their views are implemented and their effective previews are on: Notifications (with its unread badge), Host monitor and Scheduler each register their rail entry together with their view, so a preview never shows an entry that opens an unfinished placeholder.

Oracle docking and width budgets include the 64 px rail. If the conversation cannot keep its 360 px minimum, Oracle temporarily overlays without changing the saved docking preference.

DOM order follows the layout: desktop rail before session navigation, drawer footer after it. Closed drawer entries are inert and removed from the accessibility tree. Closing a feature view on a phone restores the drawer before focus returns to its opener.

Navigation visibility is derived from the actual implemented entry list, not a second list of feature flags. A single enabled feature therefore keeps its drawer/footer entry reachable without enabling the desktop rail. App settings remains available through the existing sidebar shortcut when the desktop rail is off. Compact positioning and hidden labels apply only to the actual desktop rail, not feature-only footer navigation.

`displayName` is a validated, revision-checked hub profile setting, not an account. App › Display name is available with the rail preview. An unset name resolves on the hub to the single `git config --global --get user.name` value, then `$USER`, then “User”. Only the validated name is returned by the existing settings route (`?defaults=displayName`); no other Git configuration is read or exposed. Resetting the profile key restores that default. The default is cached for the route lifetime; edits sync through the existing settings events.
