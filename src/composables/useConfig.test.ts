import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useConfig } from './useConfig'

vi.mock('@/lib/tauri', () => ({
  loadConfig: vi.fn(),
  saveConfig: vi.fn(),
}))

import { loadConfig, saveConfig } from '@/lib/tauri'
import { DEFAULT_CONFIG } from '@/types'

describe('useConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('load() 在 Tauri 失败时返回默认配置', async () => {
    vi.mocked(loadConfig).mockRejectedValue(new Error('not in tauri'))
    const { load } = useConfig()
    const config = await load()
    expect(config).toEqual(DEFAULT_CONFIG)
  })

  it('load() 在成功时返回解析后的配置', async () => {
    vi.mocked(loadConfig).mockResolvedValue({
      durationMinutes: 60,
      soundId: 'bell-2',
      volume: 0.5,
    })
    const { load } = useConfig()
    const config = await load()
    expect(config).toEqual({
      durationMinutes: 60,
      soundId: 'bell-2',
      volume: 0.5,
    })
  })

  it('save() 调用底层 saveConfig', async () => {
    vi.mocked(saveConfig).mockResolvedValue(undefined)
    const { save } = useConfig()
    await save({ durationMinutes: 30, soundId: 'bell-1', volume: 0.8 })
    expect(saveConfig).toHaveBeenCalledWith({
      durationMinutes: 30,
      soundId: 'bell-1',
      volume: 0.8,
    })
  })
})
