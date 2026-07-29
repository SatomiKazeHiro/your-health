use tauri::{AppHandle, Manager, WebviewUrl, WebviewWindowBuilder};

#[tauri::command]
pub async fn open_alert_window(app: AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("alert") {
        window.show().map_err(|e| e.to_string())?;
        window.set_focus().map_err(|e| e.to_string())?;
        return Ok(());
    }
    WebviewWindowBuilder::new(&app, "alert", WebviewUrl::App("index.html#/alert".into()))
        .title("")
        .inner_size(600.0, 480.0)
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