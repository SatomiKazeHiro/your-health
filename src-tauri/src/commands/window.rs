use tauri::{AppHandle, Manager, WebviewUrl, WebviewWindowBuilder};

#[tauri::command]
pub async fn open_alert_window(app: AppHandle, url_path: String) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("alert") {
        window.show().map_err(|e| e.to_string())?;
        window.set_focus().map_err(|e| e.to_string())?;
        return Ok(());
    }
    let url = format!("index.html#{}", url_path);
    WebviewWindowBuilder::new(&app, "alert", WebviewUrl::App(url.into()))
        .title("")
        .inner_size(480.0, 640.0)
        .decorations(false)
        .always_on_top(true)
        .resizable(false)
        .skip_taskbar(true)
        .build()
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn close_alert_window(app: AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("alert") {
        window.close().map_err(|e| e.to_string())?;
    }
    Ok(())
}