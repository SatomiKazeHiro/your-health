import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  TimerState,
  AppConfig,
  DEFAULT_CONFIG,
  DurationOption,
  SoundId,
  SNOOZE_SECONDS,
} from '@/types'

export const useTimerStore = defineStore('timer', () => {
  const state = ref<TimerState>('idle')
  const totalSeconds = ref(0)
  const remainingSeconds = ref(0)
  const selectedDuration = ref<DurationOption>(DEFAULT_CONFIG.durationMinutes)
  const selectedSound = ref<SoundId>(DEFAULT_CONFIG.soundId)

  const progress = computed(() => {
    if (totalSeconds.value === 0) return 0
    return 1 - remainingSeconds.value / totalSeconds.value
  })

  function applyConfig(config: AppConfig) {
    selectedDuration.value = config.durationMinutes
    selectedSound.value = config.soundId
  }

  function start() {
    if (state.value !== 'idle') return
    totalSeconds.value = selectedDuration.value * 60
    remainingSeconds.value = totalSeconds.value
    state.value = 'running'
  }

  function pause() {
    if (state.value !== 'running') return
    state.value = 'paused'
  }

  function resume() {
    if (state.value !== 'paused') return
    state.value = 'running'
  }

  function end() {
    if (state.value !== 'running' && state.value !== 'paused') return
    state.value = 'idle'
    remainingSeconds.value = 0
    totalSeconds.value = 0
  }

  function tick(elapsedSeconds: number) {
    if (state.value !== 'running') return
    remainingSeconds.value = Math.max(0, remainingSeconds.value - elapsedSeconds)
    if (remainingSeconds.value === 0) {
      state.value = 'alerting'
    }
  }

  function acknowledge() {
    if (state.value !== 'alerting') return
    state.value = 'idle'
    remainingSeconds.value = 0
    totalSeconds.value = 0
  }

  function snooze() {
    if (state.value !== 'alerting') return
    totalSeconds.value = SNOOZE_SECONDS
    remainingSeconds.value = SNOOZE_SECONDS
    state.value = 'running'
  }

  return {
    state,
    totalSeconds,
    remainingSeconds,
    selectedDuration,
    selectedSound,
    progress,
    applyConfig,
    start,
    pause,
    resume,
    end,
    tick,
    acknowledge,
    snooze,
  }
})
