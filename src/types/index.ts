// 状态机状态
export type TimerState = 'idle' | 'running' | 'paused' | 'alerting'

// 时长选项
export const DURATION_OPTIONS = [1, 30, 45, 60, 90] as const
export type DurationOption = (typeof DURATION_OPTIONS)[number]

// 铃声选项
export const SOUND_OPTIONS = [
  { id: 'bell-1', label: '清脆铃声' },
  { id: 'bell-2', label: '柔和提示' },
  { id: 'bell-3', label: '鸟鸣叮咚' },
  { id: 'bell-4', label: '电子提示' },
  { id: 'bell-5', label: '木质风铃' },
] as const
export type SoundId = (typeof SOUND_OPTIONS)[number]['id']

// 应用配置
export interface AppConfig {
  durationMinutes: DurationOption
  soundId: SoundId
  volume: number  // 0.0 - 1.0
}

// 默认配置
export const DEFAULT_CONFIG: AppConfig = {
  durationMinutes: 45,
  soundId: 'bell-1',
  volume: 0.7,
}

// 状态机快照
export interface TimerData {
  state: TimerState
  totalSeconds: number
  remainingSeconds: number
  selectedDuration: DurationOption
  selectedSound: SoundId
}

// Snooze 固定时长(秒) - MVP 硬编码
export const SNOOZE_SECONDS = 300
