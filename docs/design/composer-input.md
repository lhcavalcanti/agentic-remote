# Composer input compatibility

These safeguards apply to the default-off Composer refresh preview described in the [application specification](../app-spec.md).

## Touch delivery choices

A blur with an unknown focus target is not evidence that focus moved outside the Steer/Queue menu. Older Safari and WKWebView can report `relatedTarget: null` between a menu item's pointerdown and click; the menu must remain mounted so the intended choice is delivered once. An outside pointerdown or confirmed outside focus still dismisses the menu without sending. Tab and Shift+Tab retain native focus movement; Escape restores the actual opener.
