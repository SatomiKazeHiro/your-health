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

const ALLOWED_DURATIONS: [u32; 4] = [30, 45, 60, 90];
const ALLOWED_SOUND_IDS: &[&str] = &["bell-1", "bell-2", "bell-3", "bell-4", "bell-5"];

fn validate_duration(d: u32) -> u32 {
    if ALLOWED_DURATIONS.contains(&d) {
        d
    } else {
        45
    }
}

fn validate_volume(v: f32) -> f32 {
    if v.is_finite() && (0.0..=1.0).contains(&v) {
        v
    } else {
        0.7
    }
}

fn validate_sound_id(id: &str) -> String {
    let trimmed = id.trim();
    if !trimmed.is_empty() && ALLOWED_SOUND_IDS.contains(&trimmed) {
        trimmed.to_string()
    } else {
        "bell-1".to_string()
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

    Ok(AppConfig {
        duration_minutes: validate_duration(duration),
        sound_id: validate_sound_id(&sound_id),
        volume: validate_volume(volume),
    })
}

#[tauri::command]
pub fn save_config(app: AppHandle, config: AppConfig) -> Result<(), String> {
    let duration_minutes = validate_duration(config.duration_minutes);
    let sound_id = validate_sound_id(&config.sound_id);
    let volume = validate_volume(config.volume);

    let store = app.store("config.json").map_err(|e| e.to_string())?;
    store.set("durationMinutes", serde_json::json!(duration_minutes));
    store.set("soundId", serde_json::json!(sound_id));
    store.set("volume", serde_json::json!(volume));
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

    #[test]
    fn duration_validation() {
        assert_eq!(validate_duration(30), 30);
        assert_eq!(validate_duration(45), 45);
        assert_eq!(validate_duration(60), 60);
        assert_eq!(validate_duration(90), 90);
        assert_eq!(validate_duration(0), 45);
        assert_eq!(validate_duration(15), 45);
        assert_eq!(validate_duration(120), 45);
    }

    #[test]
    fn volume_validation() {
        assert!((validate_volume(0.0) - 0.0).abs() < 0.001);
        assert!((validate_volume(0.5) - 0.5).abs() < 0.001);
        assert!((validate_volume(1.0) - 1.0).abs() < 0.001);
        assert!((validate_volume(-0.1) - 0.7).abs() < 0.001);
        assert!((validate_volume(1.5) - 0.7).abs() < 0.001);
        assert!((validate_volume(f32::NAN) - 0.7).abs() < 0.001);
        assert!((validate_volume(f32::INFINITY) - 0.7).abs() < 0.001);
    }

    #[test]
    fn sound_id_validation() {
        // existing valid cases
        assert_eq!(validate_sound_id("bell-1"), "bell-1");
        assert_eq!(validate_sound_id("bell-5"), "bell-5");
        // existing fallback cases (empty/whitespace)
        assert_eq!(validate_sound_id(""), "bell-1");
        assert_eq!(validate_sound_id("   "), "bell-1");
        assert_eq!(validate_sound_id("  bell-2  "), "bell-2");
        // NEW: non-allowlist values fall back
        assert_eq!(validate_sound_id("bell-99"), "bell-1");
        assert_eq!(validate_sound_id("../etc/passwd"), "bell-1");
        assert_eq!(validate_sound_id("custom"), "bell-1");
    }
}