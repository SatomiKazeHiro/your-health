use serde::{Deserialize, Serialize};
use tauri::AppHandle;
use tauri_plugin_store::StoreExt;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AppConfig {
    pub duration_minutes: u32,
    pub sound_id: String,
    pub volume: f32,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            duration_minutes: 45,
            sound_id: "bell-1".to_string(),
            volume: 0.7,
        }
    }
}

#[tauri::command]
pub fn load_config(app: AppHandle) -> Result<AppConfig, String> {
    let store = app.store("config.json").map_err(|e| e.to_string())?;
    let duration = store
        .get("durationMinutes")
        .and_then(|v| v.as_u64())
        .map(|v| v as u32)
        .unwrap_or(45);
    let sound_id = store
        .get("soundId")
        .and_then(|v| v.as_str().map(|s| s.to_string()))
        .unwrap_or_else(|| "bell-1".to_string());
    let volume = store
        .get("volume")
        .and_then(|v| v.as_f64())
        .map(|v| v as f32)
        .unwrap_or(0.7);

    let duration_minutes = match duration {
        30 | 45 | 60 | 90 => duration,
        _ => 45,
    };

    Ok(AppConfig {
        duration_minutes,
        sound_id,
        volume,
    })
}

#[tauri::command]
pub fn save_config(app: AppHandle, config: AppConfig) -> Result<(), String> {
    let store = app.store("config.json").map_err(|e| e.to_string())?;
    store.set("durationMinutes", serde_json::json!(config.duration_minutes));
    store.set("soundId", serde_json::json!(config.sound_id));
    store.set("volume", serde_json::json!(config.volume));
    store.save().map_err(|e| e.to_string())?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn default_config() {
        let c = AppConfig::default();
        assert_eq!(c.duration_minutes, 45);
        assert_eq!(c.sound_id, "bell-1");
        assert!((c.volume - 0.7).abs() < 0.001);
    }
}