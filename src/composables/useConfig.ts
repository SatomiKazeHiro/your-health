import type { AppConfig } from '@/types'
import { DEFAULT_CONFIG } from '@/types'
import { loadConfig, saveConfig as tauriSaveConfig } from '@/lib/tauri'

export function useConfig() {
  async function load(): Promise<AppConfig> {
    try {
      return await loadConfig()
    } catch (err) {
      console.warn('loadConfig failed, using defaults:', err)
      return DEFAULT_CONFIG
    }
  }

  async function save(config: AppConfig): Promise<void> {
    try {
      await tauriSaveConfig(config)
    } catch (err) {
      console.error('saveConfig failed:', err)
      throw err
    }
  }

  return { load, save }
}
