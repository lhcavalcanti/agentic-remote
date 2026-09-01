//! Agentic Remote desktop shell.
//!
//! The shell owns the window, tray, badge, notifications, and deep links. The
//! UI itself is served by the hub over HTTPS and loaded directly, so the shell
//! never bundles a copy of the app and the page stays same-origin with the API
//! it calls. See `docs/desktop-app.md` for why that matters.

mod bridge;
mod config;

use std::path::PathBuf;
use std::sync::Mutex;

use config::HubConfig;
use serde::Deserialize;
use tauri::menu::{Menu, MenuItem};
use tauri::tray::TrayIconBuilder;
use tauri::{AppHandle, Manager, WebviewUrl, WebviewWindowBuilder};
use tauri_plugin_deep_link::DeepLinkExt;
use tauri_plugin_global_shortcut::{GlobalShortcutExt, ShortcutState};
use tauri_plugin_notification::NotificationExt;

const MAIN_WINDOW: &str = "main";
const SETTINGS_WINDOW: &str = "settings";
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
    if cfg!(target_os = "macos") {
        "macos"
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
/// machine rather than to the binary. Permissions are enumerated individually;
/// no filesystem, shell, or process permission is ever granted to a remote
/// origin.
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

fn open_hub_window(app: &AppHandle, url: &str) -> Result<(), String> {
    if let Some(window) = app.get_webview_window(MAIN_WINDOW) {
        let _ = window.show();
        let _ = window.set_focus();
        return Ok(());
    }
    let parsed = url.parse().map_err(|_| format!("Invalid hub URL: {url}"))?;
    WebviewWindowBuilder::new(app, MAIN_WINDOW, WebviewUrl::External(parsed))
        .title("Agentic Remote")
        .inner_size(1_180.0, 820.0)
        .min_inner_size(420.0, 480.0)
        .initialization_script(bridge::script(env!("CARGO_PKG_VERSION"), platform()))
        .build()
        .map(|_| ())
        .map_err(|error| error.to_string())
}

fn open_settings_window(app: &AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window(SETTINGS_WINDOW) {
        let _ = window.show();
        let _ = window.set_focus();
        return Ok(());
    }
    WebviewWindowBuilder::new(app, SETTINGS_WINDOW, WebviewUrl::App("index.html".into()))
        .title("Agentic Remote settings")
        .inner_size(520.0, 580.0)
        .resizable(false)
        .build()
        .map(|_| ())
        .map_err(|error| error.to_string())
}

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

fn deliver(app: &AppHandle, channel: &str, payload_json: &str) {
    if let Some(window) = app.get_webview_window(MAIN_WINDOW) {
        let _ = window.eval(bridge::emit(channel, payload_json));
    }
}

#[tauri::command]
fn set_badge(app: AppHandle, count: i64) {
    let value = if count > 0 { Some(count) } else { None };
    if let Some(window) = app.get_webview_window(MAIN_WINDOW) {
        let _ = window.set_badge_count(value);
    }
}

/// Raise a native notification.
///
/// Action buttons are intentionally not implemented yet: on desktop the plugin
/// uses `notify-rust`, which cannot register the notification categories macOS
/// needs for inline actions. The web app already sends `actions`, so answering
/// from the notification can be added here without changing the web app.
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
    // `notify-rust` exposes no cross-platform withdrawal, so this is accepted
    // and ignored rather than reported as an error the web app cannot act on.
}

#[tauri::command]
fn open_settings(app: AppHandle) -> Result<(), String> {
    open_settings_window(&app)
}

#[tauri::command]
fn hub_config(state: tauri::State<'_, ShellState>) -> HubConfig {
    state.config.lock().expect("config lock").clone()
}

/// Persist a new hub address and open it.
///
/// Switching hubs destroys the previous window so one hub's Access session is
/// never presented to another.
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

    if let Some(window) = app.get_webview_window(MAIN_WINDOW) {
        let _ = window.destroy();
    }
    open_hub_window(&app, &url)?;
    if let Some(window) = app.get_webview_window(SETTINGS_WINDOW) {
        let _ = window.close();
    }
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(|app, _shortcut, event| {
                    if event.state == ShortcutState::Pressed {
                        toggle_main_window(app);
                    }
                })
                .build(),
        )
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

            build_tray(&handle)?;
            register_shortcut(&handle, config.shortcut.as_deref());

            {
                let handle = handle.clone();
                app.deep_link().on_open_url(move |event| {
                    for url in event.urls() {
                        deliver(&handle, "deepLink", &bridge::json_string(url.as_str()));
                    }
                });
            }

            grant_hub_capability(&handle, &config.origins());
            match config.primary() {
                // A hub that has never been configured opens settings rather
                // than failing, so the first launch explains itself.
                Some(url) => open_hub_window(&handle, &url).map_err(std::io::Error::other)?,
                None => open_settings_window(&handle).map_err(std::io::Error::other)?,
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running Agentic Remote desktop");
}

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
                let _ = open_settings_window(app);
            }
            "quit" => app.exit(0),
            _ => {}
        })
        .build(app)?;
    Ok(())
}

fn register_shortcut(app: &AppHandle, configured: Option<&str>) {
    let accelerator = configured
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .unwrap_or(DEFAULT_SHORTCUT);
    if let Err(error) = app.global_shortcut().register(accelerator) {
        eprintln!("Unable to register global shortcut {accelerator}: {error}");
    }
}
