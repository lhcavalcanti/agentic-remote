//! Persisted shell settings.
//!
//! The hub address is deliberately not compiled into the binary. Host topology
//! belongs to the machine, so the shell reads it from the user's config
//! directory and falls back to a first-run settings window when it is absent.

use std::fs;
use std::path::{Path, PathBuf};

use serde::{Deserialize, Serialize};

/// Where the shell should point, plus the optional LAN address used when the
/// primary URL cannot be reached.
#[derive(Clone, Debug, Default, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct HubConfig {
    /// Primary hub URL, for example `https://agentic.example.com`.
    #[serde(default)]
    pub url: Option<String>,
    /// Optional direct address used when `url` is unreachable.
    #[serde(default)]
    pub lan_url: Option<String>,
    /// Global shortcut that shows or hides the window.
    #[serde(default)]
    pub shortcut: Option<String>,
}

impl HubConfig {
    pub fn config_path(config_dir: &Path) -> PathBuf {
        config_dir.join("shell.json")
    }

    /// Read the stored configuration, treating an unreadable or malformed file
    /// as "not configured yet" so a corrupt file sends the user to the settings
    /// window instead of preventing startup.
    pub fn load(config_dir: &Path) -> Self {
        fs::read_to_string(Self::config_path(config_dir))
            .ok()
            .and_then(|raw| serde_json::from_str(&raw).ok())
            .unwrap_or_default()
    }

    pub fn save(&self, config_dir: &Path) -> Result<(), String> {
        fs::create_dir_all(config_dir).map_err(|error| error.to_string())?;
        let raw = serde_json::to_string_pretty(self).map_err(|error| error.to_string())?;
        fs::write(Self::config_path(config_dir), raw).map_err(|error| error.to_string())
    }

    /// The URLs this shell is allowed to talk to, primary first.
    pub fn origins(&self) -> Vec<String> {
        [self.url.as_deref(), self.lan_url.as_deref()]
            .into_iter()
            .flatten()
            .filter_map(normalize_origin)
            .collect()
    }

    pub fn primary(&self) -> Option<String> {
        self.url.as_deref().and_then(normalize_url)
    }
}

/// Accept only `http` and `https`. A shell that navigated to `file://` or a
/// custom scheme would be same-origin with nothing and could not authenticate,
/// and granting IPC to such an origin would widen the trust boundary.
pub fn normalize_url(value: &str) -> Option<String> {
    let trimmed = value.trim().trim_end_matches('/');
    if trimmed.is_empty() {
        return None;
    }
    let lower = trimmed.to_ascii_lowercase();
    if !lower.starts_with("http://") && !lower.starts_with("https://") {
        return None;
    }
    // Reject a bare scheme with no host.
    let host = lower
        .split_once("://")
        .map(|(_, rest)| rest)
        .unwrap_or_default();
    if host.is_empty() || host.starts_with('/') {
        return None;
    }
    Some(trimmed.to_string())
}

/// Capability URLs are matched per origin, so strip any path component.
fn normalize_origin(value: &str) -> Option<String> {
    let normalized = normalize_url(value)?;
    let (scheme, rest) = normalized.split_once("://")?;
    let authority = rest.split('/').next().unwrap_or_default();
    if authority.is_empty() {
        return None;
    }
    Some(format!("{scheme}://{authority}"))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn accepts_http_and_https() {
        assert_eq!(
            normalize_url("https://agentic.example.com/"),
            Some("https://agentic.example.com".to_string())
        );
        assert_eq!(
            normalize_url("  http://192.0.2.10:4317  "),
            Some("http://192.0.2.10:4317".to_string())
        );
    }

    #[test]
    fn rejects_other_schemes_and_empty_hosts() {
        assert_eq!(normalize_url("file:///tmp/index.html"), None);
        assert_eq!(normalize_url("agentic://computer/a/session/b"), None);
        assert_eq!(normalize_url("https://"), None);
        assert_eq!(normalize_url("https:///path"), None);
        assert_eq!(normalize_url("   "), None);
    }

    #[test]
    fn origins_drop_paths_and_preserve_order() {
        let config = HubConfig {
            url: Some("https://agentic.example.com/app".into()),
            lan_url: Some("http://192.0.2.10:4317".into()),
            shortcut: None,
        };
        assert_eq!(
            config.origins(),
            vec![
                "https://agentic.example.com".to_string(),
                "http://192.0.2.10:4317".to_string()
            ]
        );
    }

    #[test]
    fn origins_skip_unset_and_invalid_entries() {
        let config = HubConfig {
            url: None,
            lan_url: Some("not-a-url".into()),
            shortcut: None,
        };
        assert!(config.origins().is_empty());
        assert_eq!(config.primary(), None);
    }
}
