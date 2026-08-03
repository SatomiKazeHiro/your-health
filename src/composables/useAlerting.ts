import { watch } from 'vue'
import { useTimerStore } from '@/stores/timerStore'
import { openAlertWindow } from '@/lib/tauri'

export function useAlerting() {
  const store = useTimerStore()

  watch(
    () => store.state,
    async (newState, oldState) => {
      if (newState === 'alerting' && oldState === 'running') {
        const params = new URLSearchParams({
          minutes: String(store.selectedDuration),
          sound: store.selectedSound,
          volume: String(store.volume),
        })
        try {
          await openAlertWindow(`/alert?${params.toString()}`)
        } catch (err) {
          console.error('Failed to open alert window:', err)
        }
      }
    }
  )
}