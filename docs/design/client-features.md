# Client navigation previews

The client feature registry describes a label, lucide icon, optional ordered rail entry and open action. It has no server counterpart: a server plugin registry is unnecessary until a server feature needs one. Existing origin-enforced route registration and service startup remain authoritative.

`desktopRail` is a default-off Interface preview. Above 960 px it adds a compact rail beside the unchanged session navigation; narrower layouts place the same footer entries at the bottom of the drawer. Existing shortcuts and session ownership do not change. The Oracle button opens the existing Oracle panel. Feature entries appear only when their views are implemented and their effective previews are on.

Oracle docking and width budgets include the 64 px rail. If the conversation cannot keep its 360 px minimum, Oracle temporarily overlays without changing the saved docking preference.

DOM order follows the layout: desktop rail before session navigation, drawer footer after it. Closed drawer entries are inert and removed from the accessibility tree. Closing a feature view on a phone restores the drawer before focus returns to its opener.

`displayName` is a validated, revision-checked hub profile setting, not an account. App › Display name is available with the rail preview. An unset name resolves on the hub to the single `git config --global --get user.name` value, then `$USER`, then “User”. Only the validated name is returned by the existing settings route (`?defaults=displayName`); no other Git configuration is read or exposed. Resetting the profile key restores that default. The default is cached for the route lifetime; edits sync through the existing settings events.
