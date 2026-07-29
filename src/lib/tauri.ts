import { invoke } from '@tauri-apps/api/core'
import type { AppConfig, DurationOption, SoundId } from '@/types'

interface RustAppConfig {
  duration_minutes: number
  sound_id: string
  volume: number
}

function toAppConfig(rust: RustAppConfig): AppConfig {
  return {
    durationMinutes: rust.duration_minutes as DurationOption,
    soundId: rust.sound_id as SoundId,
    volume: rust.volume,
  }
}

export async function loadConfig(): Promise<AppConfig> {
  const rust = await invoke<RustAppConfig>('load_config')
  return toAppConfig(rust)
}

export async function saveConfig(config: AppConfig): Promise<void> {
  await invoke('save_config', {
    config: {
      duration_minutes: config.durationMinutes,
      sound_id: config.soundId,
      volume: config.volume,
    },
  })
}

export async function openAlertWindow(): Promise<void> {
  await invoke('open_alert_window')
}

export async function closeAlertWindow(): Promise<void> {
  await invoke('close_alert_window')
}
