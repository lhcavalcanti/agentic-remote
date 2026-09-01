//! The script injected into the hub page.
//!
//! This is the only contract between the shell and the web app. Its shape must
//! stay in step with `src/desktop.ts` in the repository root, which
//! feature-detects every method so an older shell degrades instead of breaking.
//!
//! Direction of travel:
//! - web to native uses Tauri IPC, which requires the runtime capability granted
//!   to the configured hub origin;
//! - native to web uses `eval` of `__emit`, which needs no capability.

/// Build the initialization script for a shell of the given version.
pub fn script(version: &str, platform: &str) -> String {
    format!(
        r#"(() => {{
  const internals = window.__TAURI_INTERNALS__;
  if (!internals || typeof internals.invoke !== 'function') {{
    return;
  }}
  const invoke = (command, payload) => {{
    try {{
      const result = internals.invoke(command, payload);
      if (result && typeof result.catch === 'function') {{
        result.catch(() => undefined);
      }}
    }} catch {{
      // A refused command must never surface as a page error.
    }}
  }};
  const listeners = {{ notificationReply: new Set(), deepLink: new Set() }};
  const subscribe = (channel, handler) => {{
    if (typeof handler !== 'function') {{
      return () => undefined;
    }}
    listeners[channel].add(handler);
    return () => listeners[channel].delete(handler);
  }};
  window.__AGENTIC_DESKTOP__ = {{
    version: {version},
    platform: {platform},
    setBadge(count) {{
      invoke('set_badge', {{ count }});
    }},
    notify(notification) {{
      invoke('notify', {{ notification }});
    }},
    withdrawNotifications(tags) {{
      invoke('withdraw_notifications', {{ tags }});
    }},
    openSettings() {{
      invoke('open_settings', {{}});
    }},
    onNotificationReply(handler) {{
      return subscribe('notificationReply', handler);
    }},
    onDeepLink(handler) {{
      return subscribe('deepLink', handler);
    }},
    __emit(channel, payload) {{
      const handlers = listeners[channel];
      if (!handlers) {{
        return;
      }}
      for (const handler of [...handlers]) {{
        try {{
          handler(payload);
        }} catch {{
          // One bad subscriber must not stop the others.
        }}
      }}
    }},
  }};
}})();"#,
        version = json_string(version),
        platform = json_string(platform),
    )
}

/// Deliver a native event to the page. The payload is already JSON.
pub fn emit(channel: &str, payload_json: &str) -> String {
    format!(
        "window.__AGENTIC_DESKTOP__ && window.__AGENTIC_DESKTOP__.__emit({}, {});",
        json_string(channel),
        payload_json
    )
}

/// Serialize as a JSON string literal so a value can never terminate the script.
pub fn json_string(value: &str) -> String {
    serde_json::to_string(value).unwrap_or_else(|_| "\"\"".to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn script_defines_the_bridge_and_carries_identity() {
        let generated = script("0.1.0", "macos");
        assert!(generated.contains("window.__AGENTIC_DESKTOP__"));
        assert!(generated.contains("\"0.1.0\""));
        assert!(generated.contains("\"macos\""));
        for method in [
            "setBadge",
            "notify",
            "withdrawNotifications",
            "onNotificationReply",
            "onDeepLink",
            "__emit",
        ] {
            assert!(generated.contains(method), "missing {method}");
        }
    }

    #[test]
    fn identity_cannot_break_out_of_the_script() {
        let generated = script("0.1.0\"; window.pwned = 1; \"", "macos");
        assert!(!generated.contains("window.pwned = 1;\n"));
        assert!(generated.contains("\\\""));
    }

    #[test]
    fn emit_quotes_the_channel() {
        assert_eq!(
            emit("deepLink", "\"agentic://computer/a/session/b\""),
            "window.__AGENTIC_DESKTOP__ && window.__AGENTIC_DESKTOP__.__emit(\"deepLink\", \"agentic://computer/a/session/b\");"
        );
    }

    #[test]
    fn json_string_escapes_quotes_and_newlines() {
        assert_eq!(json_string("a\"b\nc"), "\"a\\\"b\\nc\"");
    }
}
