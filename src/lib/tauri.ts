import { invoke } from '@tauri-apps/api/core'
import type { AppConfig, DurationOption, SoundId } from '@/types'
import { DURATION_OPTIONS, SOUND_OPTIONS } from '@/types'

interface RustAppConfig {
  duration_minutes: number
  sound_id: string
  volume: number
}

const SOUND_IDS: readonly string[] = SOUND_OPTIONS.map(s => s.id)
const DURATION_SET = new Set<number>(DURATION_OPTIONS)

function toAppConfig(rust: RustAppConfig): AppConfig {
  if (!DURATION_SET.has(rust.duration_minutes)) {
    throw new Error(`invalid duration: ${rust.duration_minutes}`)
  }
  if (!SOUND_IDS.includes(rust.sound_id)) {
    throw new Error(`invalid sound: ${rust.sound_id}`)
  }
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
