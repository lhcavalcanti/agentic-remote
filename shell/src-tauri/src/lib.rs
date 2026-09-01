//! Agentic Remote native shell.
//!
//! One Tauri project targets macOS, iOS, Windows, and Linux. The UI is served
//! by the hub over HTTPS and loaded directly, so the shell never bundles a copy
//! of the app and the page stays same-origin with the API it calls. See
//! `docs/native-shell.md` for why that matters.
//!
//! Window model, deliberately the same everywhere:
//! - `main` is created once and shows either the hub or the local settings page.
//! - Saving settings navigates `main` to the hub.
//! - Desktop additionally offers a second `settings` window from the tray,
//!   because iOS is single-window.

mod bridge;
mod config;

use std::path::PathBuf;
use std::sync::Mutex;

use config::HubConfig;
use serde::Deserialize;
use tauri::{AppHandle, Manager, WebviewUrl, WebviewWindowBuilder};
use tauri_plugin_deep_link::DeepLinkExt;
use tauri_plugin_notification::{NotificationExt, PermissionState};

#[cfg(desktop)]
use tauri::menu::{Menu, MenuItem};
#[cfg(desktop)]
use tauri::tray::TrayIconBuilder;
#[cfg(desktop)]
use tauri_plugin_global_shortcut::{GlobalShortcutExt, ShortcutState};

const MAIN_WINDOW: &str = "main";
const SETTINGS_PAGE: &str = "index.html";

#[cfg(desktop)]
const SETTINGS_WINDOW: &str = "settings";
#[cfg(desktop)]
const DEFAULT_SHORTCUT: &str = "CmdOrCtrl+Shift+A";

struct ShellState {
    config: Mutex<HubConfig>,
    /// Events that arrived before the page could receive them, such as the
    /// deep link that launched the app.
    pending: Mutex<Vec<(String, String)>>,
    ready: Mutex<bool>,
}

impl ShellState {
    fn new(config: HubConfig) -> Self {
        Self {
            config: Mutex::new(config),
            pending: Mutex::new(Vec::new()),
            ready: Mutex::new(false),
        }
    }

    fn bridge_ready(&self) -> bool {
        *self.ready.lock().expect("ready lock")
    }

    fn queue(&self, channel: String, payload: String) {
        self.pending
            .lock()
            .expect("pending lock")
            .push((channel, payload));
    }

    fn take_pending(&self) -> Vec<(String, String)> {
        *self.ready.lock().expect("ready lock") = true;
        std::mem::take(&mut *self.pending.lock().expect("pending lock"))
    }

    /// A new document has no bridge listeners yet, so anything delivered before
    /// it subscribes must be queued again rather than assumed received.
    fn reset_bridge(&self) {
        *self.ready.lock().expect("ready lock") = false;
    }
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct NotificationRequest {
    tag: String,
    title: String,
    body: String,
    #[serde(default)]
    urgent: bool,
}

/// A stable notification id derived from the tag.
///
/// The platform APIs address notifications by integer id, while the web app
/// addresses them by tag, so the mapping has to be deterministic for a later
/// withdrawal to find the same notification. FNV-1a keeps it dependency-free.
fn notification_id(tag: &str) -> i32 {
    let mut hash: u32 = 2_166_136_261;
    for byte in tag.as_bytes() {
        hash ^= u32::from(*byte);
        hash = hash.wrapping_mul(16_777_619);
    }
    // Keep it positive so it survives platforms that reject negative ids.
    (hash >> 1) as i32
}

fn platform() -> &'static str {
    if cfg!(target_os = "ios") {
        "ios"
    } else if cfg!(target_os = "macos") {
        "macos"
    } else if cfg!(target_os = "android") {
        "android"
    } else if cfg!(target_os = "windows") {
        "windows"
    } else {
        "linux"
    }
}

fn config_dir(app: &AppHandle) -> Result<PathBuf, String> {
    app.path()
        .app_config_dir()
        .map_err(|error| error.to_string())
}

/// Commands the hub page is allowed to call.
///
/// Tauri refuses every custom command from a remote origin unless a capability
/// names it, so this list is what makes the injected bridge work at all.
///
/// `hub_config` and `save_hub_config` are deliberately absent: the hub must not
/// be able to read or rewrite which hub this app points at. They are granted
/// only to the locally served settings page.
const HUB_PERMISSIONS: &[&str] = &[
    "allow-set-badge",
    "allow-notify",
    "allow-withdraw-notifications",
    "allow-open-settings",
    "allow-bridge-ready",
];

/// Grant IPC to the configured hub origins and nothing else.
///
/// The capability is built at runtime because the hub address belongs to the
/// machine rather than to the binary. `local(false)` keeps it off the locally
/// served settings page, which has its own capability. No filesystem, shell, or
/// process permission is ever granted to a remote origin.
fn grant_hub_capability(app: &AppHandle, origins: &[String]) {
    if origins.is_empty() {
        return;
    }
    let mut capability = tauri::ipc::CapabilityBuilder::new("hub-remote")
        .local(false)
        .window(MAIN_WINDOW);
    for origin in origins {
        capability = capability.remote(origin.clone());
    }
    for permission in HUB_PERMISSIONS {
        capability = capability.permission(*permission);
    }
    if let Err(error) = app.add_capability(capability) {
        eprintln!("Unable to grant hub capability: {error}");
    }
}

/// Create the single main webview, pointed at the hub when one is configured
/// and at the local settings page otherwise. The bridge script is installed
/// here and re-runs on every navigation, so it survives the move from the
/// settings page to the hub.
fn create_main_window(app: &AppHandle, config: &HubConfig) -> Result<(), String> {
    // A configured hub that answers nowhere would open a window that never
    // loads, leaving an iOS user with no way back to settings. Fall through to
    // the settings page and say why instead.
    let url = match (config.primary().is_some(), config.reachable_url()) {
        (_, Some(hub)) => {
            let parsed = hub.parse().map_err(|_| format!("Invalid hub URL: {hub}"))?;
            WebviewUrl::External(parsed)
        }
        (true, None) => WebviewUrl::App(format!("{SETTINGS_PAGE}?unreachable=1").into()),
        (false, None) => WebviewUrl::App(SETTINGS_PAGE.into()),
    };
    let navigation_handle = app.clone();
    let builder = WebviewWindowBuilder::new(app, MAIN_WINDOW, url)
        .title("Agentic Remote")
        .initialization_script(bridge::script(env!("CARGO_PKG_VERSION"), platform()))
        .on_navigation(move |_url| {
            navigation_handle.state::<ShellState>().reset_bridge();
            true
        });

    #[cfg(desktop)]
    let builder = builder
        .inner_size(1_180.0, 820.0)
        .min_inner_size(420.0, 480.0);

    builder
        .build()
        .map(|_| ())
        .map_err(|error| error.to_string())
}

/// Point the existing main window at the hub.
fn show_hub(app: &AppHandle, url: &str) -> Result<(), String> {
    let parsed = url.parse().map_err(|_| format!("Invalid hub URL: {url}"))?;
    match app.get_webview_window(MAIN_WINDOW) {
        Some(window) => {
            app.state::<ShellState>().reset_bridge();
            window.navigate(parsed).map_err(|error| error.to_string())?;
            // Showing and focusing a window is a desktop-only API; iOS has a
            // single always-visible webview.
            #[cfg(desktop)]
            {
                let _ = window.show();
                let _ = window.set_focus();
            }
            Ok(())
        }
        None => create_main_window(
            app,
            &HubConfig {
                url: Some(url.to_string()),
                ..HubConfig::default()
            },
        ),
    }
}

/// Open settings. Desktop gets a second window; iOS is single-window, so the
/// main webview navigates back to the local page instead.
#[cfg(desktop)]
fn show_settings(app: &AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window(SETTINGS_WINDOW) {
        let _ = window.show();
        let _ = window.set_focus();
        return Ok(());
    }
    WebviewWindowBuilder::new(app, SETTINGS_WINDOW, WebviewUrl::App(SETTINGS_PAGE.into()))
        .title("Agentic Remote settings")
        .inner_size(520.0, 580.0)
        .resizable(false)
        .build()
        .map(|_| ())
        .map_err(|error| error.to_string())
}

#[cfg(not(desktop))]
fn show_settings(app: &AppHandle) -> Result<(), String> {
    let window = app
        .get_webview_window(MAIN_WINDOW)
        .ok_or_else(|| "The main window is not available".to_string())?;
    let url = format!("tauri://localhost/{SETTINGS_PAGE}")
        .parse()
        .map_err(|_| "Invalid settings URL".to_string())?;
    window.navigate(url).map_err(|error| error.to_string())
}

/// Deliver a native event to the page.
///
/// A link that launched the app arrives before the hub has loaded and
/// subscribed, so an undeliverable payload is queued and flushed once the page
/// reports that its bridge is ready.
fn deliver(app: &AppHandle, channel: &str, payload_json: &str) {
    let delivered = app
        .get_webview_window(MAIN_WINDOW)
        .map(|window| window.eval(bridge::emit(channel, payload_json)).is_ok())
        .unwrap_or(false);
    if delivered && app.state::<ShellState>().bridge_ready() {
        return;
    }
    app.state::<ShellState>()
        .queue(channel.to_string(), payload_json.to_string());
}

fn handle_deep_links(app: &AppHandle, urls: impl IntoIterator<Item = String>) {
    for url in urls {
        deliver(app, "deepLink", &bridge::json_string(&url));
    }
}

/// Called by the page once `window.__AGENTIC_SHELL__` is installed and the hub
/// has had a chance to subscribe. Flushes anything that arrived too early.
#[tauri::command]
fn bridge_ready(app: AppHandle) {
    let pending = app.state::<ShellState>().take_pending();
    for (channel, payload) in pending {
        if let Some(window) = app.get_webview_window(MAIN_WINDOW) {
            let _ = window.eval(bridge::emit(&channel, &payload));
        }
    }
}

/// Publish the count of sessions awaiting the user.
///
/// `set_badge_count` lives in a `#[cfg(desktop)]` impl block, so despite its
/// documentation mentioning iOS it is not callable there. Setting an iOS badge
/// needs either an APNs payload carrying `badge` or a small Swift addition to
/// the generated Xcode project, both of which arrive with the APNs work.
#[tauri::command]
fn set_badge(app: AppHandle, count: i64) {
    #[cfg(desktop)]
    {
        let value = if count > 0 { Some(count) } else { None };
        if let Some(window) = app.get_webview_window(MAIN_WINDOW) {
            let _ = window.set_badge_count(value);
        }
    }
    #[cfg(not(desktop))]
    {
        let _ = (app, count);
    }
}

/// Whether notifications may be shown, asking once if the user has not decided.
///
/// A fresh iOS install starts in `notDetermined` and silently drops everything
/// until permission is requested, so this must run before the first notify.
fn notifications_allowed(app: &AppHandle) -> bool {
    let notification = app.notification();
    let state = match notification.permission_state() {
        Ok(state) => state,
        Err(error) => {
            eprintln!("Unable to read notification permission: {error}");
            return false;
        }
    };
    let state = if state == PermissionState::Prompt || state == PermissionState::PromptWithRationale
    {
        match notification.request_permission() {
            Ok(requested) => requested,
            Err(error) => {
                eprintln!("Unable to request notification permission: {error}");
                return false;
            }
        }
    } else {
        state
    };
    state == PermissionState::Granted
}

/// Raise a native notification.
///
/// Action buttons are not wired up yet. On iOS the plugin uses
/// `UNUserNotificationCenter` and can register action categories; on desktop it
/// uses `notify-rust`, which cannot. The web app already sends `actions`, so
/// both can be added here without changing the web app.
///
/// Urgency is carried through as far as the platform allows: the plugin's
/// desktop builder exposes no urgency setting, so today it only distinguishes
/// the grouping of urgent and routine notifications.
#[tauri::command]
fn notify(app: AppHandle, notification: NotificationRequest) {
    if !notifications_allowed(&app) {
        return;
    }
    let group = if notification.urgent {
        "agentic-attention"
    } else {
        "agentic-status"
    };
    let _ = app
        .notification()
        .builder()
        .id(notification_id(&notification.tag))
        .group(group)
        .title(notification.title)
        .body(notification.body)
        .show();
}

/// Withdraw notifications the user has now dealt with.
///
/// `remove_active` is mobile-only in the notification plugin; desktop exposes
/// no withdrawal, so there the request is accepted and ignored rather than
/// reported as an error the web app cannot act on.
#[tauri::command]
fn withdraw_notifications(app: AppHandle, tags: Vec<String>) {
    #[cfg(mobile)]
    {
        let ids = tags.iter().map(|tag| notification_id(tag)).collect();
        if let Err(error) = app.notification().remove_active(ids) {
            eprintln!("Unable to withdraw notifications: {error}");
        }
    }
    #[cfg(not(mobile))]
    {
        let _ = (app, tags);
    }
}

#[tauri::command]
fn open_settings(app: AppHandle) -> Result<(), String> {
    show_settings(&app)
}

#[tauri::command]
fn hub_config(state: tauri::State<'_, ShellState>) -> HubConfig {
    state.config.lock().expect("config lock").clone()
}

/// Persist a new hub address and open it.
#[tauri::command]
fn save_hub_config(
    app: AppHandle,
    state: tauri::State<'_, ShellState>,
    config: HubConfig,
) -> Result<(), String> {
    // Resolve rather than taking the primary, so saving a hub whose public
    // address is down still opens the direct address instead of waiting for a
    // restart.
    let url = config
        .resolve()
        .ok_or_else(|| "Enter a hub URL beginning with http:// or https://".to_string())?;
    let directory = config_dir(&app)?;
    config.save(&directory)?;
    grant_hub_capability(&app, &config.origins());
    *state.config.lock().expect("config lock") = config;

    show_hub(&app, &url)?;

    #[cfg(desktop)]
    if let Some(window) = app.get_webview_window(SETTINGS_WINDOW) {
        let _ = window.close();
    }
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default();

    // Must be registered before any other plugin. A second launch, including
    // one carrying an `agentic://` link, hands its arguments to the running
    // instance instead of starting a rival process.
    #[cfg(desktop)]
    let builder = builder.plugin(tauri_plugin_single_instance::init(|app, argv, _cwd| {
        handle_deep_links(
            app,
            argv.into_iter()
                .filter(|argument| argument.starts_with("agentic://")),
        );
        if let Some(window) = app.get_webview_window(MAIN_WINDOW) {
            let _ = window.show();
            let _ = window.set_focus();
        }
    }));

    let builder = builder
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_notification::init());

    // iOS has no system-wide shortcut concept, and the plugin refuses to build
    // for mobile targets at all.
    #[cfg(desktop)]
    let builder = builder.plugin(
        tauri_plugin_global_shortcut::Builder::new()
            .with_handler(|app, _shortcut, event| {
                if event.state == ShortcutState::Pressed {
                    toggle_main_window(app);
                }
            })
            .build(),
    );

    builder
        .invoke_handler(tauri::generate_handler![
            set_badge,
            notify,
            withdraw_notifications,
            open_settings,
            hub_config,
            save_hub_config,
            bridge_ready
        ])
        .setup(|app| {
            let handle = app.handle().clone();
            let directory = config_dir(&handle).map_err(std::io::Error::other)?;
            let config = HubConfig::load(&directory);

            app.manage(ShellState::new(config.clone()));

            #[cfg(desktop)]
            {
                build_tray(&handle)?;
                register_shortcut(&handle, config.shortcut.as_deref());
            }

            {
                let handle = handle.clone();
                app.deep_link().on_open_url(move |event| {
                    handle_deep_links(&handle, event.urls().into_iter().map(|url| url.to_string()));
                });
            }

            // Windows and Linux deliver a launch-time link as a process
            // argument rather than through `on_open_url`, so it must be read
            // explicitly or a cold-start link is silently dropped.
            #[cfg(desktop)]
            if let Ok(Some(urls)) = app.deep_link().get_current() {
                handle_deep_links(&handle, urls.into_iter().map(|url| url.to_string()));
            }

            grant_hub_capability(&handle, &config.origins());
            // A hub that has never been configured lands on the settings page
            // rather than failing, so the first launch explains itself.
            create_main_window(&handle, &config).map_err(std::io::Error::other)?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running Agentic Remote");
}

#[cfg(desktop)]
fn toggle_main_window(app: &AppHandle) {
    let Some(window) = app.get_webview_window(MAIN_WINDOW) else {
        return;
    };
    if window.is_visible().unwrap_or(false) && window.is_focused().unwrap_or(false) {
        let _ = window.hide();
    } else {
        let _ = window.show();
        let _ = window.set_focus();
    }
}

#[cfg(desktop)]
fn build_tray(app: &AppHandle) -> tauri::Result<()> {
    // Without a bundled icon there is nothing to show; a missing tray is far
    // better than refusing to start.
    let Some(icon) = app.default_window_icon().cloned() else {
        return Ok(());
    };
    let show = MenuItem::with_id(app, "show", "Show Agentic Remote", true, None::<&str>)?;
    let settings = MenuItem::with_id(app, "settings", "Settings…", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&show, &settings, &quit])?;

    TrayIconBuilder::with_id("agentic-remote")
        .icon(icon)
        .tooltip("Agentic Remote")
        .menu(&menu)
        .on_menu_event(|app, event| match event.id().as_ref() {
            "show" => {
                if let Some(window) = app.get_webview_window(MAIN_WINDOW) {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
            "settings" => {
                let _ = show_settings(app);
            }
            "quit" => app.exit(0),
            _ => {}
        })
        .build(app)?;
    Ok(())
}

#[cfg(desktop)]
fn register_shortcut(app: &AppHandle, configured: Option<&str>) {
    let accelerator = configured
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .unwrap_or(DEFAULT_SHORTCUT);
    if let Err(error) = app.global_shortcut().register(accelerator) {
        eprintln!("Unable to register global shortcut {accelerator}: {error}");
    }
}
