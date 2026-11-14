# Client navigation previews

The client feature registry describes a label, lucide icon, optional ordered rail entry and open action. It has no server counterpart: a server plugin registry is unnecessary until a server feature needs one. Existing origin-enforced route registration and service startup remain authoritative.

`desktopRail` is a default-off Interface preview. At 1,024 px and wider it adds a compact rail beside the unchanged session navigation; narrower layouts place the same footer entries at the bottom of the drawer. Existing shortcuts and session ownership do not change. Host, notification and scheduler entries additionally require their own effective preview (including the hub flag).

`displayName` is a validated, revision-checked hub profile setting, not an account. App › Display name is available with the rail preview. An unset name resolves on the hub to the single `git config --global --get user.name` value, then `$USER`, then “User”. Only the validated name is returned by the existing settings route (`?defaults=displayName`); no other Git configuration is read or exposed. Resetting the profile key restores that default. The default is cached for the route lifetime; edits sync through the existing settings events.
