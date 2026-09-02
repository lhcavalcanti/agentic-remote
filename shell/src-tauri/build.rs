fn main() {
    // Declaring the commands generates an `allow-<command>` permission for each
    // one. Without a manifest, a remote origin can reach no custom command at
    // all, so the injected bridge would silently do nothing at runtime.
    tauri_build::try_build(tauri_build::Attributes::new().app_manifest(
        tauri_build::AppManifest::new().commands(&[
            "set_badge",
            "notify",
            "withdraw_notifications",
            "open_settings",
            "hub_config",
            "save_hub_config",
            "bridge_ready",
        ]),
    ))
    .expect("failed to run tauri-build")
}
