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
use tauri_plugin_notification::NotificationExt;

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
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct NotificationRequest {
    title: String,
    body: String,
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
    if let Err(error) = app.add_capability(capability) {
        eprintln!("Unable to grant hub capability: {error}");
    }
}

/// Create the single main webview, pointed at the hub when one is configured
/// and at the local settings page otherwise. The bridge script is installed
/// here and re-runs on every navigation, so it survives the move from the
/// settings page to the hub.
fn create_main_window(app: &AppHandle, config: &HubConfig) -> Result<(), String> {
    let url = match config.primary() {
        Some(hub) => {
            let parsed = hub.parse().map_err(|_| format!("Invalid hub URL: {hub}"))?;
            WebviewUrl::External(parsed)
        }
        None => WebviewUrl::App(SETTINGS_PAGE.into()),
    };
    let builder = WebviewWindowBuilder::new(app, MAIN_WINDOW, url)
        .title("Agentic Remote")
        .initialization_script(bridge::script(env!("CARGO_PKG_VERSION"), platform()));

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

fn deliver(app: &AppHandle, channel: &str, payload_json: &str) {
    if let Some(window) = app.get_webview_window(MAIN_WINDOW) {
        let _ = window.eval(bridge::emit(channel, payload_json));
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

/// Raise a native notification.
///
/// Action buttons are not wired up yet. On iOS the plugin uses
/// `UNUserNotificationCenter` and can register action categories; on desktop it
/// uses `notify-rust`, which cannot. The web app already sends `actions`, so
/// both can be added here without changing the web app.
#[tauri::command]
fn notify(app: AppHandle, notification: NotificationRequest) {
    let _ = app
        .notification()
        .builder()
        .title(notification.title)
        .body(notification.body)
        .show();
}

#[tauri::command]
fn withdraw_notifications(_app: AppHandle, _tags: Vec<String>) {
    // No cross-platform withdrawal exists yet, so this is accepted and ignored
    // rather than reported as an error the web app cannot act on.
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
    let url = config
        .primary()
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
    let builder = tauri::Builder::default()
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
            save_hub_config
        ])
        .setup(|app| {
            let handle = app.handle().clone();
            let directory = config_dir(&handle).map_err(std::io::Error::other)?;
            let config = HubConfig::load(&directory);

            app.manage(ShellState {
                config: Mutex::new(config.clone()),
            });

            #[cfg(desktop)]
            {
                build_tray(&handle)?;
                register_shortcut(&handle, config.shortcut.as_deref());
            }

            {
                let handle = handle.clone();
                app.deep_link().on_open_url(move |event| {
                    for url in event.urls() {
                        deliver(&handle, "deepLink", &bridge::json_string(url.as_str()));
                    }
                });
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
