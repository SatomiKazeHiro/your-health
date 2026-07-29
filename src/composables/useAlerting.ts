import { watch } from 'vue'
import { useTimerStore } from '@/stores/timerStore'
import { openAlertWindow } from '@/lib/tauri'

export function useAlerting() {
  const store = useTimerStore()

  watch(
    () => store.state,
    async (newState, oldState) => {
      if (newState === 'alerting' && oldState === 'running') {
        try {
          await openAlertWindow()
        } catch (err) {
          console.error('Failed to open alert window:', err)
        }
      }
    }
  )
}