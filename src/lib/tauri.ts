import { invoke } from '@tauri-apps/api/core'
import type { AppConfig, SoundId, DurationOption } from '@/types'

interface RustAppConfig {
  duration_minutes: number
  sound_id: string
  volume: number
}

interface AlertWindowParams {
  urlPath: string
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

export async function openAlertWindow(urlPath: string): Promise<void> {
  await invoke<unknown>('open_alert_window', { urlPath } satisfies AlertWindowParams)
}

export async function closeAlertWindow(): Promise<void> {
  await invoke('close_alert_window')
}